import os
import sys
import re
import requests
import pytesseract
from PIL import Image, ImageOps, ImageFilter
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth.models import User

from .models import FamilyProfile
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


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer


@api_view(['GET', 'POST'])
@authentication_classes([])  # Completely bypasses authorization headers for testing
@permission_classes([AllowAny])
def family_profile_list_create(request):
    if request.method == 'GET':
        profiles = FamilyProfile.objects.all()
        serializer = FamilyProfileSerializer(profiles, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        # STRICT LIMIT CHECK: Prevent adding more than 4 family profiles
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
@authentication_classes([])  # Bypasses auth checks for deleting profiles
@permission_classes([AllowAny])
def family_profile_detail(request, pk):
    try:
        profile = FamilyProfile.objects.get(pk=pk)
    except FamilyProfile.DoesNotExist:
        return Response({"error": "Profile not found."}, status=status.HTTP_404_NOT_FOUND)

    profile.delete()
    return Response({"message": "Profile deleted successfully from database."}, status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@authentication_classes([])  # Bypasses auth checks for AI chatting endpoints
@permission_classes([AllowAny])
def ai_chat_view(request):
    member_id = request.data.get('member_id')
    user_question = request.data.get('question')

    try:
        profile = FamilyProfile.objects.get(id=member_id)
        patient_context = (
            f"Patient Name: {profile.name}\n"
            f"Relation: {profile.relation}, Age: {profile.age}\n"
            f"Vitals - Height: {profile.height}, Weight: {profile.weight}, A1C: {profile.a1c}, BP: {profile.blood_pressure}\n"
            f"Medicines, Prescriptions and Conditions: {profile.conditions}\n"
        )
    except FamilyProfile.DoesNotExist:
        patient_context = "No specific patient profile selected."

    prompt = (
        f"You are MedLife AI, a strict medical and health assistant. Your role is exclusively to analyze patient health records and answer medical or wellness questions.\n\n"
        f"CRITICAL RULES:\n"
        f"1. You do NOT have access to answer questions that are unrelated to medicine, health, vitals, or clinical records.\n"
        f"2. If the user's question is NOT medical or health-related, you must respond EXACTLY with: 'I am a medical health assistant and I have no access to answer non-medical questions. Please ask a health or medical-related question.'\n"
        f"3. If the question IS medical, answer strictly using the patient records provided below.\n\n"
        f"--- PATIENT RECORDS ---\n"
        f"{patient_context}\n"
        f"--- END OF RECORDS ---\n\n"
        f"User Question: {user_question}"
    )

    try:
        ollama_res = requests.post(
            'http://localhost:11434/api/generate',
            json={
                'model': 'qwen:1.8b',
                'prompt': prompt,
                'stream': False
            },
            timeout=30
        )

        if ollama_res.status_code == 200:
            ai_reply = ollama_res.json().get('response', 'No response generated.')
        else:
            ai_reply = f"[Error]: Ollama returned status {ollama_res.status_code}"
    except Exception as e:
        ai_reply = f"[System Error]: Could not connect to local Ollama. Details: {str(e)}"

    return Response({"response": ai_reply})


@api_view(['POST'])
@authentication_classes([])  # Bypasses auth requirements for standard OCR upload scan
@permission_classes([AllowAny])
def scan_prescription_view(request):
    image_file = request.FILES.get('image')
    if not image_file:
        return Response({"error": "No image provided."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Load Pillow Image format
        img = Image.open(image_file)
        
        # 1. Advanced Processing: Convert to Grayscale & Double scale to improve handwritten stroke detection
        img_gray = img.convert('L')
        width, height = img_gray.size
        img_large = img_gray.resize((width * 2, height * 2), Image.Resampling.LANCZOS)
        
        # Enhanced contrast curves to emphasize pen ink over paper noise
        img_enhanced = ImageOps.autocontrast(img_large, cutoff=1)
        img_processed = img_enhanced.filter(ImageFilter.SHARPEN)

        # Execute OCR with custom paragraph formatting and standard configurations
        custom_config = r'--oem 3 --psm 4'
        extracted_text = pytesseract.image_to_string(img_processed, config=custom_config)
        text_lower = extracted_text.lower()
        
        # Negative Validation: Strictly reject non-medical forms like academic applications
        forbidden_terms = ['examination application form', 'university', 'enrollment no', 'semester', 'branch of course']
        if any(term in text_lower for term in forbidden_terms):
            return Response(
                {"error": "This is not the correct image uploaded. Please upload a valid doctor's prescription."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 2. Strict Handwriting and Medical keyword patterns validation
        patterns_to_check = [
            r'\b\d+\s*(?:ml|mg|g|ug|tab|caps?|capsule?s?|d|days?|hr?s?|weeks?|month?s?)\b', # Metrics like 4ml, 3ml, 5d, 3d, etc.
            r'\b(?:syp|syrup|tab|tablet|cap|capsule|inj|injection|oint|drops?|rx|advic?e|clinical?|diagnosis|patient|age|date|weight|reg\.?\s*no|dr|doctor|history|pa|bp|heart|resp|temp|investigations?|treatment)\b', # Common handwritten Cues
            r'\b(?:calpol|delcon|levolin|meftal|ifa|calcium|paracetamol|crocin|aspirin|amoxicillin|pantocid|metformin|vitamin)\b' # Pre-selected common medications
        ]

        # Gather any matching metrics or descriptors from natural paragraphs
        matches_found = 0
        for pattern in patterns_to_check:
            found = re.findall(pattern, text_lower)
            matches_found += len(found)

        # Final layout check to confirm header descriptors (e.g. patients, drs) are found
        is_medical_format = any(keyword in text_lower for keyword in ['patient', 'clinical', 'advice', 'date', 'weight', 'age', 'dr.', 'doctor', 'hospital', 'clinic'])

        if matches_found < 2 and not is_medical_format:
            return Response(
                {"error": "Could not verify this as a valid prescription or medical card. Please upload a clearer English prescription image."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Output natural paragraphs parsed from document image to form text box
        return Response({"extracted_text": extracted_text.strip()}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": f"OCR processing failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)