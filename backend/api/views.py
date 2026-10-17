import os
import sys
import io
import base64
import traceback
import pytesseract
import requests
from PIL import Image
# from django.db.models import Q
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings

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

from django.db.models import Q
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail
from django.conf import settings

@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def forgot_password_view(request):
    identifier = request.data.get('email') or request.data.get('username')
    if not identifier:
        return Response({"error": "Email or username is required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Search database by matching either username or email
        user = User.objects.get(Q(email=identifier) | Q(username=identifier))
        
        if not user.email:
            return Response(
                {"error": f"The account '{user.username}' does not have an email address on file."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        # Link pointing to your frontend reset page
        reset_link = f"http://localhost:5173/reset-password?uid={uid}&token={token}"
        
        send_mail(
            subject="MedLife.ai Password Reset Request",
            message=f"Hello {user.username},\n\nClick the link below to reset your password for your MedLife.ai account:\n{reset_link}\n\nIf you did not request this, please ignore this email.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        return Response({"message": f"Password reset link successfully sent to {user.email}!"}, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        # Return success for security to prevent user enumeration, or a clear message
        return Response({"message": "If an account with that details exists, a reset link has been sent."}, status=status.HTTP_200_OK)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
        
        if default_token_generator.check_token(user, token):
            user.set_password(new_password)
            user.save()
            return Response({"message": "Password has been reset successfully. You can now sign in."}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid or expired reset token."}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"error": "Invalid reset request."}, status=status.HTTP_400_BAD_REQUEST)


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

    ChatMessage.objects.create(profile=profile, sender='user', text=user_question)

    patient_context = (
        f"Patient Name: {profile.name}\n"
        f"Relation: {profile.relation}, Age: {profile.age}\n"
        f"Vitals - Height: {profile.height}, Weight: {profile.weight}, A1C: {profile.a1c}, BP: {profile.blood_pressure}\n"
        f"Medicines, Prescriptions and Conditions: {profile.conditions}\n"
    )

    prompt = (
        f"You are MedLife AI, an expert clinical assistant. Analyze the patient profile and answer clearly.\n\n"
        f"--- PATIENT RECORDS ---\n{patient_context}\n--- END ---\n\n"
        f"User Question: {user_question}"
    )

    model_choice = request.data.get('model', 'Ollama')
    api_key = request.data.get('api_key', '')

    try:
        if model_choice == 'Gemini':
            if not api_key:
                ai_reply = "[Error]: Please enter your Gemini API key and click Connect."
            else:
                ai_reply = call_gemini(prompt, api_key)
        else:
            ollama_res = requests.post(
                'http://localhost:11434/api/generate',
                json={'model': 'qwen:1.8b', 'prompt': prompt, 'stream': False},
                timeout=90
            )
            if ollama_res.status_code == 200:
                ai_reply = ollama_res.json().get('response', 'No response generated.')
            else:
                ai_reply = f"[Error]: Ollama returned status {ollama_res.status_code}"
    except Exception as e:
        ai_reply = f"[System Error]: {str(e)}"

    ChatMessage.objects.create(profile=profile, sender='ai', text=ai_reply)

    return Response({"response": ai_reply}, status=status.HTTP_200_OK)



def structure_with_qwen(ocr_text):
    """Turn raw OCR text into a medicine list using the local qwen:1.8b model.
    Returns None if Ollama is unavailable, so the caller falls back to raw text."""
    prompt = (
        "Below is OCR text from a doctor's prescription. List each medicine on its own "
        "line as: name | dose | frequency | duration. Use ONLY what is in the text. "
        "If something is missing or unclear, write (?). Do not add medicines or "
        "information that is not in the text.\n\n" + ocr_text
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

        # ---------- Gemini (cloud) branch: unchanged ----------
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
                "frequency and duration, plus any diagnosis or notes. Return a short plain "
                "list, one medicine per line. If a word is unclear, write it followed by (?) "
                "instead of guessing."
            )
            extracted_text = call_gemini(prompt, api_key, image_b64=encoded_image)
            return Response({"extracted_text": extracted_text}, status=status.HTTP_200_OK)

        # ---------- Local branch: CRAFT + TrOCR + rapidfuzz, then qwen:1.8b ----------
        from .ocr_engine import read_prescription

        image_file.seek(0)
        ocr_img = Image.open(image_file).convert('RGB')
        ocr_img.thumbnail((1600, 1600), Image.Resampling.LANCZOS)

        lines = read_prescription(ocr_img)  # list of corrected text lines
        if not lines:
            return Response(
                {"error": "Could not find any readable text. Try a clearer, flat, well-lit photo."},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY
            )

        raw_text = "\n".join(lines)
        structured = structure_with_qwen(raw_text)

        return Response(
            {
                "extracted_text": structured or raw_text,  # falls back to raw OCR text
                "raw_text": raw_text,                       # lets the UI show both
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