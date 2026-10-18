import os
import sys
import io
import base64
import traceback
import pytesseract
import requests
import cv2
import numpy as np
from PIL import Image
from rapidfuzz import process, fuzz
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.db.models import Q
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode

from .models import FamilyProfile, ChatMessage
from .serializers import RegisterSerializer, FamilyProfileSerializer

# --- ROBUST TESSERACT PATH CONFIGURATION FOR WINDOWS ---
if sys.platform == "win32":
    possible_paths = [
        r"C:\Program Files\Tesseract-OCR\tesseract.exe",
        r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
        os.path.expanduser(r"~\AppData\Local\Programs\Tesseract-OCR\tesseract.exe")
    ]
    for path in possible_paths:
        if os.path.exists(path):
            pytesseract.pytesseract.tesseract_cmd = path
            break


# --- GEMINI HELPER ---
GEMINI_MODEL = "gemini-3.8-flash"


def call_gemini(prompt, api_key, image_b64=None):
    """Send a text (and optional image) prompt to Google Gemini and return the reply text."""
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"
    parts = [{"text": prompt}]
    if image_b64:
        parts.append({"inline_data": {"mime_type": "image/jpeg", "data": image_b64}})

    res = requests.post(
        url,
        headers={"x-goog-api-key": api_key, "Content-Type": "application/json"},
        json={"contents": [{"parts": parts}]},
        timeout=90,
    )
    if res.status_code != 200:
        raise Exception(f"Gemini error {res.status_code}: {res.text[:300]}")

    data = res.json()
    return data["candidates"][0]["content"]["parts"][0]["text"].strip()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer


@api_view(['GET', 'POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def family_profile_list_create(request):
    if request.method == 'GET':
        profiles = FamilyProfile.objects.all()
        serializer = FamilyProfileSerializer(profiles, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        if FamilyProfile.objects.count() >= 4:
            return Response(
                {"error": "Maximum limit of 4 family members reached."},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = FamilyProfileSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=None)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@authentication_classes([])
@permission_classes([AllowAny])
def family_profile_detail(request, pk):
    try:
        profile = FamilyProfile.objects.get(pk=pk)
    except FamilyProfile.DoesNotExist:
        return Response({"error": "Profile not found."}, status=status.HTTP_404_NOT_FOUND)

    profile.delete()
    return Response({"message": "Profile deleted successfully from database."}, status=status.HTTP_200_OK)


# --- PASSWORD RESET VIEWS ---

RESET_REQUEST_MESSAGE = "If an account with those details exists, a reset link has been sent to its email."


@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def forgot_password_view(request):
    identifier = (request.data.get('email') or request.data.get('username') or '').strip()
    if not identifier:
        return Response({"error": "Email or username is required."}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.filter(Q(email__iexact=identifier) | Q(username__iexact=identifier)).first()

    if not user or not user.email:
        return Response({"message": RESET_REQUEST_MESSAGE}, status=status.HTTP_200_OK)

    token = default_token_generator.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    reset_link = f"{settings.FRONTEND_URL}/reset-password?uid={uid}&token={token}"

    try:
        send_mail(
            subject="MedLife.ai Password Reset Request",
            message=(
                f"Hello {user.username},\n\n"
                f"Click the link below to reset your password for your MedLife.ai account:\n"
                f"{reset_link}\n\n"
                f"If you did not request this, please ignore this email."
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
    except Exception:
        traceback.print_exc()
        return Response(
            {"error": "Could not send the email right now. Please try again later."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    return Response({"message": RESET_REQUEST_MESSAGE}, status=status.HTTP_200_OK)


@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def reset_password_confirm_view(request):
    uidb64 = request.data.get('uid')
    token = request.data.get('token')
    new_password = request.data.get('new_password')

    if not uidb64 or not token or not new_password:
        return Response({"error": "All fields are required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(pk=force_str(urlsafe_base64_decode(uidb64)))
    except (User.DoesNotExist, ValueError, TypeError, OverflowError):
        return Response({"error": "Invalid reset request."}, status=status.HTTP_400_BAD_REQUEST)

    if not default_token_generator.check_token(user, token):
        return Response({"error": "Invalid or expired reset link."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        validate_password(new_password, user)
    except ValidationError as e:
        return Response({"error": " ".join(e.messages)}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new_password)
    user.save()
    return Response(
        {"message": "Password has been reset successfully. You can now sign in."},
        status=status.HTTP_200_OK
    )


# --- AI CHAT ---

OFF_TOPIC_REPLY = (
    "I can only help with health and medical questions about this patient, such as "
    "medicines, symptoms, test results, diet or care. Please ask something related to health."
)


def is_health_question(question, profile, model_choice, api_key):
    recent = list(profile.chats.order_by('-timestamp')[1:3])[::-1]
    history = "\n".join(f"{c.sender}: {c.text[:150]}" for c in recent) or "(none)"

    prompt = (
        "You are a filter for a health assistant. Decide if the user's NEW question is about "
        "health or medicine: symptoms, illness, medicines, doses, side effects, test results, "
        "diet, fitness, pregnancy, mental health, or the patient's care.\n"
        "Answer with exactly one word: YES or NO.\n\n"
        f"Patient record: {(profile.conditions or '')[:300]}\n"
        f"Recent chat:\n{history}\n\n"
        f"NEW question: {question} ->"
    )
    try:
        if model_choice == 'Gemini':
            answer = call_gemini(prompt, api_key) if api_key else 'YES'
        else:
            r = requests.post(
                'http://localhost:11434/api/generate',
                json={
                    'model': 'qwen:1.8b',
                    'prompt': prompt,
                    'stream': False,
                    'keep_alive': '10m',
                    'options': {'num_predict': 3, 'temperature': 0},
                },
                timeout=60,
            )
            answer = r.json().get('response', '') if r.status_code == 200 else 'YES'
        return not answer.strip().upper().startswith('NO')
    except Exception:
        traceback.print_exc()
        return True


@api_view(['GET', 'POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def ai_chat_view(request):
    member_id = request.data.get('member_id') if request.method == 'POST' else request.GET.get('member_id')

    try:
        profile = FamilyProfile.objects.get(id=member_id)
    except FamilyProfile.DoesNotExist:
        return Response({"error": "Profile not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        chats = profile.chats.order_by('timestamp')
        chat_data = [{"sender": c.sender, "text": c.text, "timestamp": c.timestamp} for c in chats]
        return Response({"history": chat_data}, status=status.HTTP_200_OK)

    user_question = request.data.get('question')
    if not user_question:
        return Response({"error": "No question provided."}, status=status.HTTP_400_BAD_REQUEST)

    model_choice = request.data.get('model', 'Ollama')
    api_key = request.data.get('api_key', '')

    ChatMessage.objects.create(profile=profile, sender='user', text=user_question)

    if not is_health_question(user_question, profile, model_choice, api_key):
        ChatMessage.objects.create(profile=profile, sender='ai', text=OFF_TOPIC_REPLY)
        return Response({"response": OFF_TOPIC_REPLY}, status=status.HTTP_200_OK)

    patient_context = (
        f"Patient Name: {profile.name}\n"
        f"Relation: {profile.relation}, Age: {profile.age}\n"
        f"Vitals - Height: {profile.height}, Weight: {profile.weight}, A1C: {profile.a1c}, BP: {profile.blood_pressure}\n"
        f"Medicines, Prescriptions and Conditions: {profile.conditions}\n"
    )

    prompt = (
        "You are MedLife AI, a clinical assistant. Answer only health and medical questions, "
        "using the patient records below. Do not guess doses. Keep answers short and clear.\n\n"
        f"--- PATIENT RECORDS ---\n{patient_context}\n--- END ---\n\n"
        f"User Question: {user_question}"
    )

    try:
        if model_choice == 'Gemini':
            if not api_key:
                ai_reply = "[Error]: Please enter your Gemini API key and click Connect."
            else:
                ai_reply = call_gemini(prompt, api_key)
        else:
            ollama_res = requests.post(
                'http://localhost:11434/api/generate',
                json={
                    'model': 'qwen:1.8b',
                    'prompt': prompt,
                    'stream': False,
                    'keep_alive': '10m',
                    'options': {'num_predict': 300, 'temperature': 0.3},
                },
                timeout=300
            )
            if ollama_res.status_code == 200:
                ai_reply = ollama_res.json().get('response', 'No response generated.')
            else:
                ai_reply = f"[Error]: Ollama returned status {ollama_res.status_code}"
    except Exception as e:
        ai_reply = f"[System Error]: {str(e)}"

    ChatMessage.objects.create(profile=profile, sender='ai', text=ai_reply)
    return Response({"response": ai_reply}, status=status.HTTP_200_OK)


# --- PRESCRIPTION SCAN & EXPANDED MEDICINE DATABASE ---

MEDICINE_DATABASE = [
    "Metformin", "Vitamin D3", "Paracetamol", "Amoxicillin", "Atorvastatin",
    "Omeprazole", "Azithromycin", "Aspirin", "Ibuprofen", "Cetirizine",
    "Pantoprazole", "Amlodipine", "Losartan", "Montelukast", "Levothyroxine",
    "Multivitamin", "Calcium", "Glimepiride", "Telmisartan", "Atorva",
    "Ciprofloxacin", "Doxycycline", "Diclofenac", "Ranitidine", "Prednisolone",
    "Clindamycin", "Metronidazole", "Ondansetron", "Albendazole", "Salbutamol",
    "Budesonide", "Esomeprazole", "Domperidone", "Furosemide", "Spironolactone",
    "Gabapentin", "Pregabalin", "Methylcobalamin", "Folic Acid", "Pantocid",
    "Pan-D", "Shelcal", "Glycomet", "Januvia", "Trajenta", "Ecosprin"
]


def structure_with_qwen(ocr_text):
    prompt = (
        "Below is OCR text from a doctor's prescription. List each medicine on its own "
        "line as: name | dose | frequency | duration. Use ONLY what is in the text. "
        "If something is missing or unclear, write (?).\n\n" + ocr_text
    )
    try:
        r = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "qwen:1.8b",
                "prompt": prompt,
                "stream": False,
                "keep_alive": 0,
                "options": {"temperature": 0},
            },
            timeout=120,
        )
        if r.status_code == 200:
            return r.json().get("response", "").strip() or None
    except requests.RequestException:
        traceback.print_exc()
    return None


@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def scan_prescription_view(request):
    image_file = request.FILES.get('image')
    if not image_file:
        return Response({"error": "No image provided."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        model_choice = request.data.get('model', 'Ollama')
        api_key = request.data.get('api_key', '')

        if model_choice == 'Gemini':
            if not api_key:
                return Response(
                    {"error": "Please enter your Gemini API key and click Connect."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            img = Image.open(image_file).convert('RGB')
            img.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
            buffered = io.BytesIO()
            img.save(buffered, format="JPEG", quality=85)
            encoded_image = base64.b64encode(buffered.getvalue()).decode('utf-8')

            prompt = (
                "This is a doctor's prescription. Extract the medicine names with dosage, "
                "frequency and duration. Return a short plain list, one medicine per line."
            )
            extracted_text = call_gemini(prompt, api_key, image_b64=encoded_image)
            return Response({"extracted_text": extracted_text}, status=status.HTTP_200_OK)

        # OpenCV Preprocessing Pipeline
        image_file.seek(0)
        img_pil = Image.open(image_file).convert('RGB')
        img_np = np.array(img_pil)

        gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)
        gray = cv2.resize(gray, (0, 0), fx=1.5, fy=1.5, interpolation=cv2.INTER_CUBIC)
        denoised = cv2.fastNlMeansDenoising(gray, h=30)
        _, thresh = cv2.threshold(denoised, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

        # Tesseract OCR
        extracted_text = pytesseract.image_to_string(thresh, config='--psm 6')

        # RapidFuzz Matching against expanded database
        matched_medicines = []
        for line in extracted_text.split('\n'):
            for word in line.split():
                if len(word) > 3:
                    result = process.extractOne(word, MEDICINE_DATABASE, scorer=fuzz.ratio)
                    if result and result[1] > 70:
                        if result[0] not in matched_medicines:
                            matched_medicines.append(result[0])

        final_result = ", ".join(matched_medicines) if matched_medicines else extracted_text.strip()
        if not final_result:
            final_result = "No readable text found. Please edit manually."

        structured = structure_with_qwen(extracted_text)

        return Response(
            {
                "extracted_text": structured or final_result,
                "raw_text": extracted_text,
                "structured": structured is not None,
            },
            status=status.HTTP_200_OK
        )

    except Exception as e:
        traceback.print_exc()
        return Response(
            {"error": f"Prescription processing failed: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )