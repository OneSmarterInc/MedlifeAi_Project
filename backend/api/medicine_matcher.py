"""
medicine_matcher.py  (put this next to views.py in backend/api/)

Turns OCR text lines into structured medicine rows:
    { raw_text, name, dosage, frequency, confidence, status, suggestions }

status:
    "verified"   - name matched the medicine list strongly AND a dosage was found
    "suggested"  - probable match, or dosage missing -> user must check
    "unverified" - no good match -> user must check / type it in

To use your own medicine database, create  medicines.csv  in this same folder
with one medicine name per line (a header line "name" is allowed).
"""
import csv
import os
import re

from rapidfuzz import fuzz, process

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, "medicines.csv")

# Small starter list. Replace/extend it with medicines.csv for real use.
STARTER_MEDICINES = [
    "Metformin", "Glimepiride", "Gliclazide", "Sitagliptin", "Vildagliptin", "Pioglitazone",
    "Insulin Glargine", "Insulin Human Mixtard",
    "Amlodipine", "Atenolol", "Metoprolol", "Telmisartan", "Losartan", "Enalapril", "Ramipril",
    "Furosemide", "Spironolactone", "Hydrochlorothiazide",
    "Atorvastatin", "Rosuvastatin", "Aspirin", "Clopidogrel",
    "Paracetamol", "Dolo 650", "Crocin", "Ibuprofen", "Diclofenac", "Aceclofenac", "Naproxen",
    "Azithromycin", "Amoxicillin", "Amoxicillin Clavulanate", "Augmentin", "Cefixime",
    "Ciprofloxacin", "Doxycycline", "Metronidazole", "Levofloxacin", "Cefuroxime",
    "Pantoprazole", "Omeprazole", "Rabeprazole", "Esomeprazole", "Ranitidine", "Domperidone",
    "Ondansetron", "Loperamide", "Albendazole",
    "Cetirizine", "Levocetirizine", "Montelukast", "Salbutamol", "Prednisolone", "Deflazacort",
    "Levothyroxine", "Thyronorm",
    "Vitamin D3", "Cholecalciferol", "Calcium", "Folic Acid", "Iron Folic Acid", "IFA",
    "Vitamin B12", "Methylcobalamin", "Multivitamin", "Zinc",
    "Gabapentin", "Pregabalin", "Escitalopram", "Sertraline", "Alprazolam",
    "ORS",
]


def _load_medicines():
    names = list(STARTER_MEDICINES)
    seen = {n.lower() for n in names}
    if os.path.exists(CSV_PATH):
        try:
            with open(CSV_PATH, newline="", encoding="utf-8") as f:
                for row in csv.reader(f):
                    if not row:
                        continue
                    n = row[0].strip()
                    if n and n.lower() != "name" and n.lower() not in seen:
                        names.append(n)
                        seen.add(n.lower())
        except Exception:
            pass  # fall back to the starter list
    return names


MEDICINES = _load_medicines()
_LOWER = [m.lower() for m in MEDICINES]

# ---- regexes ----
FORM_PREFIX = re.compile(
    r"^\s*(tab(?:let)?s?|cap(?:sule)?s?|syp|syrup|inj(?:ection)?|oint(?:ment)?|drops?|susp(?:ension)?)\b\.?\s*",
    re.I,
)
DOSE_RE = re.compile(r"(\d+(?:\.\d+)?)\s*(mg|mcg|µg|g|ml|iu|units?)\b", re.I)
FREQ_PATTERN_RE = re.compile(r"\b([0-3½]\s*[-–—]\s*[0-3½]\s*[-–—]\s*[0-3½])\b")
FREQ_WORD_RE = re.compile(
    r"\b(od|bd|bid|tds|tid|qid|hs|sos|prn|once daily|twice daily|thrice daily|"
    r"at night|morning|before food|after food|daily)\b",
    re.I,
)

VERIFIED_SCORE = 90
SUGGESTED_SCORE = 75


def _extract_name(line):
    text = FORM_PREFIX.sub("", line)
    text = re.split(r"\d", text, maxsplit=1)[0]          # name is whatever comes before the first digit
    text = FREQ_WORD_RE.sub(" ", text)
    text = re.sub(r"[^A-Za-z\s\-]", " ", text)           # drop punctuation, (?) marks etc.
    return re.sub(r"\s+", " ", text).strip()


def _extract_frequency(line):
    m = FREQ_PATTERN_RE.search(line)
    if m:
        return re.sub(r"\s*[-–—]\s*", "-", m.group(1))
    words = [w.lower() for w in FREQ_WORD_RE.findall(line)]
    return " ".join(dict.fromkeys(words))  # unique, keep order


def parse_prescription_lines(lines):
    """OCR lines -> list of medicine dicts for the review screen."""
    items = []
    for raw in lines:
        line = (raw or "").strip()
        if len(line) < 3:
            continue

        name = _extract_name(line)
        if len(name) < 3:
            continue

        has_form = bool(FORM_PREFIX.match(line))
        dose_m = DOSE_RE.search(line)
        dosage = f"{dose_m.group(1)}{dose_m.group(2).lower()}" if dose_m else ""
        frequency = _extract_frequency(line)

        matches = process.extract(name.lower(), _LOWER, scorer=fuzz.WRatio, limit=3)
        best_idx, best_score = (matches[0][2], matches[0][1]) if matches else (None, 0)

        # skip header/footer lines (doctor name, date, address...)
        if not (has_form or dosage or frequency or best_score >= 80):
            continue

        if best_idx is not None and best_score >= SUGGESTED_SCORE:
            final_name = MEDICINES[best_idx]
        else:
            final_name = name.title()

        if best_score >= VERIFIED_SCORE and dosage:
            status = "verified"
        elif best_score >= SUGGESTED_SCORE:
            status = "suggested"   # includes: good name match but no dosage found
        else:
            status = "unverified"

        # the OCR/LLM itself was unsure about this line
        if "(?)" in line and status == "verified":
            status = "suggested"

        suggestions = [
            MEDICINES[m[2]] for m in matches
            if m[1] >= 60 and MEDICINES[m[2]] != final_name
        ]

        items.append({
            "raw_text": line,
            "name": final_name,
            "dosage": dosage,
            "frequency": frequency,
            "confidence": round(best_score / 100, 2),
            "status": status,
            "suggestions": suggestions,
        })
    return items


def items_to_text(items):
    """Plain-text fallback, one medicine per line."""
    return "\n".join(
        " ".join(p for p in (i["name"], i["dosage"], i["frequency"]) if p) for i in items
    )
