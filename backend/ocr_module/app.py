import streamlit as st
import cv2
from PIL import Image
import numpy as np
from rapidfuzz import process, fuzz
import torch
from transformers import TrOCRProcessor, VisionEncoderDecoderModel
import easyocr
import os

# Page configuration
st.set_page_config(page_title="MedlifeAi Handwriting OCR", layout="wide")

st.title("rxPrescription OCR Pipeline")
st.write("Upload a prescription photo to detect text lines, recognize handwriting with TrOCR, and clean up medicine names using fuzzy matching.")

@st.cache_resource
def load_models():
    # Load EasyOCR reader for detection
    reader = easyocr.Reader(['en'], gpu=torch.cuda.is_available())
    
    # Load TrOCR processor and model for handwritten text recognition
    processor = TrOCRProcessor.from_pretrained("microsoft/trocr-small-handwritten")
    model = VisionEncoderDecoderModel.from_pretrained("microsoft/trocr-small-handwritten")
    
    return reader, processor, model

@st.cache_data
def load_drugs():
    drug_path = os.path.join(os.path.dirname(__file__), "drugs.txt")
    try:
        with open(drug_path, "r") as f:
            return [line.strip() for line in f if line.strip()]
    except FileNotFoundError:
        return ["Paracetamol", "Amoxicillin", "Cetirizine", "Ibuprofen"]

with st.spinner("Loading AI models (EasyOCR & TrOCR)... Please wait."):
    reader, processor, model = load_models()
    drug_list = load_drugs()

uploaded_file = st.file_uploader("Upload Prescription Image", type=["jpg", "jpeg", "png"])

if uploaded_file is not None:
    image = Image.open(uploaded_file).convert("RGB")
    image_np = np.array(image)
    
    col1, col2 = st.columns(2)
    with col1:
        st.subheader("Uploaded Image")
        st.image(image, use_container_width=True)
        
    if st.button("Run OCR Pipeline"):
        with st.spinner("Detecting text lines and reading handwriting..."):
            # Step 1: Detect text boxes using EasyOCR
            results = reader.readtext(image_np)
            
            # Sort boxes vertically from top to bottom
            results = sorted(results, key=lambda item: item[0][0][1])
            
            extracted_results = []
            
            for idx, (bbox, text_detected, prob) in enumerate(results):
                top_left = bbox[0]
                bottom_right = bbox[2]
                pt1 = (int(top_left[0]), int(top_left[1]))
                pt2 = (int(bottom_right[0]), int(bottom_right[1]))
                
                # Crop line from original image with padding
                h, w, _ = image_np.shape
                x1 = max(0, pt1[0] - 5)
                y1 = max(0, pt1[1] - 5)
                x2 = min(w, pt2[0] + 5)
                y2 = min(h, pt2[1] + 5)
                
                cropped_img = image_np[y1:y2, x1:x2]
                
                if cropped_img.size == 0:
                    continue
                    
                pil_crop = Image.fromarray(cropped_img)
                
                # Step 2: TrOCR recognition on cropped line
                pixel_values = processor(images=pil_crop, return_tensors="pt").pixel_values
                generated_ids = model.generate(pixel_values)
                raw_text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
                
                # Step 3: RapidFuzz matching against drugs.txt
                match_result = process.extractOne(raw_text, drug_list, scorer=fuzz.WRatio)
                corrected_text = raw_text
                confidence = 0
                
                if match_result:
                    best_match, score, _ = match_result
                    if score >= 70:
                        corrected_text = best_match
                        confidence = score
                        
                extracted_results.append({
                    "crop": pil_crop,
                    "raw": raw_text,
                    "corrected": corrected_text,
                    "score": confidence
                })
                
        with col2:
            st.subheader("OCR Results & Corrections")
            full_text_output = []
            
            for i, res in enumerate(extracted_results):
                st.image(res["crop"], width=200)
                st.markdown(f"**Raw TrOCR:** `{res['raw']}`")
                st.markdown(f"**Fuzzy Corrected:** :green[`{res['corrected']}`] *(Score: {res['score']})*")
                st.markdown("---")
                full_text_output.append(res['corrected'])
                
            # Download button for final text
            text_data = "\n".join(full_text_output)
            st.download_button(
                label="Download Extracted Text (.txt)",
                data=text_data,
                file_name="prescription_output.txt",
                mime="text/plain"
            )