import os
import sys
import io
import base64
import traceback
import requests
import pytesseract
from PIL import Image
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth.models import User

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
GEMINI_MODEL = "gemini-3.8-flash"   # change if Google renames/retires it


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


@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def scan_prescription_view(request):
    image_file = request.FILES.get('image')
    if not image_file:
        return Response({"error": "No image provided."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Load image and optimize size for fast inference
        img = Image.open(image_file)
        img = img.convert('RGB')

        # Resize to balance speed and handwriting clarity
        img.thumbnail((1024, 1024), Image.Resampling.LANCZOS)

        buffered = io.BytesIO()
        img.save(buffered, format="JPEG", quality=85)
        encoded_image = base64.b64encode(buffered.getvalue()).decode('utf-8')

        model_choice = request.data.get('model', 'Ollama')
        api_key = request.data.get('api_key', '')

        prompt = (
            "This is a doctor's prescription. Extract the medicine names with dosage, "
            "frequency and duration, plus any diagnosis or notes. Return a short plain "
            "list, one medicine per line. If a word is unclear, write it followed by (?) "
            "instead of guessing."
        )

        # --- Gemini (cloud) ---
        if model_choice == 'Gemini':
            if not api_key:
                return Response(
                    {"error": "Please enter your Gemini API key and click Connect."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            extracted_text = call_gemini(prompt, api_key, image_b64=encoded_image)
            return Response({"extracted_text": extracted_text}, status=status.HTTP_200_OK)

        # --- Default: local Ollama (minicpm-v) ---
        ollama_res = requests.post(
            'http://localhost:11434/api/generate',
            json={
                'model': 'minicpm-v',
                'prompt': prompt,
                'images': [encoded_image],
                'stream': False
            },
            timeout=90
        )

        if ollama_res.status_code == 200:
            extracted_text = ollama_res.json().get('response', '').strip()
            return Response({"extracted_text": extracted_text}, status=status.HTTP_200_OK)

        return Response(
            {"error": f"Ollama vision error: Status {ollama_res.status_code}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    except Exception as e:
        traceback.print_exc()   # prints the full error in the Django terminal for debugging
        return Response(
            {"error": f"Prescription vision processing failed: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )