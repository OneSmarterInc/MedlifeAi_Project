import threading
from pathlib import Path

import numpy as np
import torch
from PIL import Image
from rapidfuzz import process

_lock = threading.Lock()
_state = {}


def _find_drugs_file():
    here = Path(__file__).parent
    candidates = [
        here / "drugs.txt",                          # backend/api/drugs.txt
        here.parent / "ocr_module" / "drugs.txt",    # backend/ocr_module/drugs.txt
    ]
    for p in candidates:
        if p.exists():
            return p
    return None


def _load():
    """Load models once, on the first request."""
    if _state:
        return
    import easyocr
    from transformers import TrOCRProcessor, VisionEncoderDecoderModel

    _state["detector"] = easyocr.Reader(["en"], gpu=False, recognizer=False)
    _state["processor"] = TrOCRProcessor.from_pretrained("microsoft/trocr-base-handwritten")
    model = VisionEncoderDecoderModel.from_pretrained("microsoft/trocr-base-handwritten")
    model.eval()
    _state["model"] = model

    drugs_file = _find_drugs_file()
    if drugs_file:
        _state["drugs"] = [
            l.strip().lower()
            for l in drugs_file.read_text(encoding="utf-8").splitlines()
            if l.strip()
        ]
    else:
        _state["drugs"] = []


def _line_crops(img, detector, pad=8):
    H, W = img.shape[:2]
    boxes = detector.detect(img, width_ths=0.8)[0][0]  # [x_min, x_max, y_min, y_max]
    boxes = sorted(boxes, key=lambda b: (b[2] + b[3]) / 2)

    lines = []
    for b in boxes:
        yc, h = (b[2] + b[3]) / 2, b[3] - b[2]
        if lines and abs(yc - lines[-1]["yc"]) < 0.6 * max(h, lines[-1]["h"]):
            L = lines[-1]
            L["boxes"].append(b)
            L["yc"] = sum((x[2] + x[3]) / 2 for x in L["boxes"]) / len(L["boxes"])
            L["h"] = max(L["h"], h)
        else:
            lines.append({"boxes": [b], "yc": yc, "h": h})

    crops = []
    for L in lines:
        x1 = max(0, int(min(b[0] for b in L["boxes"])) - pad)
        x2 = min(W, int(max(b[1] for b in L["boxes"])) + pad)
        y1 = max(0, int(min(b[2] for b in L["boxes"])) - pad)
        y2 = min(H, int(max(b[3] for b in L["boxes"])) + pad)
        crops.append(Image.fromarray(img[y1:y2, x1:x2]))
    return crops


def _correct(text, drugs):
    if not drugs:
        return text
    out = []
    for w in text.split():
        if w.isalpha() and len(w) > 3:
            m = process.extractOne(w.lower(), drugs, score_cutoff=80)
            out.append(m[0] if m else w)
        else:
            out.append(w)
    return " ".join(out)


def read_prescription(pil_image):
    """Takes a PIL RGB image, returns a list of text lines."""
    with _lock:  # one request at a time, so RAM stays safe
        _load()
        img = np.array(pil_image)
        results = []
        for crop in _line_crops(img, _state["detector"]):
            pv = _state["processor"](images=crop, return_tensors="pt").pixel_values
            with torch.no_grad():
                ids = _state["model"].generate(pv, max_new_tokens=64)
            raw = _state["processor"].batch_decode(ids, skip_special_tokens=True)[0].strip()
            if raw:
                results.append(_correct(raw, _state["drugs"]))
        return results