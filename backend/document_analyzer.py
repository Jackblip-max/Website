"""
MyanVolunteer — Document Risk Analyzer
Flask microservice  |  POST /analyze  →  risk score + breakdown
Run: pip install flask pillow numpy requests && python document_analyzer.py
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from PIL import Image, ImageChops, ImageEnhance
import io, os, math, re, struct, zlib

app = Flask(__name__)
CORS(app)

# ─── Helpers ──────────────────────────────────────────────────────────────────

def load_image(path: str) -> Image.Image:
    return Image.open(path).convert("RGB")

# ── Check 1: ELA — Error Level Analysis ───────────────────────────────────────
def ela_score(img: Image.Image) -> float:
    """
    Re-save at low quality, diff against original.
    Heavy diff → manipulation present → higher score (0-1).
    """
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=75)
    buf.seek(0)
    recompressed = Image.open(buf).convert("RGB")

    diff = ImageChops.difference(img, recompressed)
    arr  = np.array(diff).astype(np.float32)

    mean_diff = arr.mean()           # 0–255
    max_diff  = arr.max()

    # Genuine scans: mean_diff < 8, manipulated: > 20
    score = min(mean_diff / 25.0, 1.0)

    # Boost if there are isolated high-diff patches (selective editing)
    high_pixels = (arr.max(axis=2) > 40).sum()
    total_px    = arr.shape[0] * arr.shape[1]
    patch_ratio = high_pixels / total_px
    if patch_ratio > 0.02:
        score = min(score + patch_ratio * 0.5, 1.0)

    return round(float(score), 4)

# ── Check 2: Document Classifier ──────────────────────────────────────────────
def document_score(img: Image.Image) -> float:
    """
    Heuristic document classifier.
    Returns probability (0-1) that this is NOT a document (higher = riskier).
    """
    w, h = img.size
    arr  = np.array(img).astype(np.float32)

    # --- Feature 1: Aspect ratio ---
    # Most certificates/docs are landscape or near-A4 portrait
    ratio = w / h
    ratio_ok = (0.55 < ratio < 2.2)   # portrait A4=0.71, landscape A4=1.41

    # --- Feature 2: White/light background dominance ---
    brightness = arr.mean(axis=2)
    light_ratio = (brightness > 200).sum() / brightness.size  # >200/255

    # --- Feature 3: Low colour saturation (most docs are near-greyscale) ---
    r, g, b   = arr[:,:,0], arr[:,:,1], arr[:,:,2]
    sat       = (arr.max(axis=2) - arr.min(axis=2))
    low_sat   = (sat < 40).sum() / sat.size      # near-grey pixels

    # --- Feature 4: Edge density (documents have lots of text edges) ---
    grey  = np.array(img.convert("L")).astype(np.float32)
    dx    = np.abs(np.diff(grey, axis=1))
    dy    = np.abs(np.diff(grey, axis=0))
    edge_density = (dx.mean() + dy.mean()) / 2.0   # 0-255

    # --- Scoring ---
    risk = 0.0

    if not ratio_ok:
        risk += 0.20     # weird shape

    if light_ratio < 0.25:
        risk += 0.25     # very dark → probably not a paper doc

    if low_sat < 0.30:
        risk += 0.15     # very colourful → meme / photo

    if edge_density < 3.0:
        risk += 0.20     # no text edges → blank or photo

    # Bonus: very small image → screenshot thumbnail
    if w < 300 or h < 300:
        risk += 0.15

    return round(min(risk, 1.0), 4)

# ── Check 3: Metadata Anomaly ──────────────────────────────────────────────────
def metadata_score(path: str) -> float:
    """
    Check EXIF / PNG metadata for anomalies.
    Missing scanner/camera metadata OR screenshot signatures → higher risk.
    """
    risk = 0.0
    ext  = os.path.splitext(path)[1].lower()

    try:
        img = Image.open(path)
        exif = img._getexif() if hasattr(img, "_getexif") else None

        if ext in (".jpg", ".jpeg"):
            if exif is None:
                risk += 0.30    # JPEG with no EXIF is suspicious
            else:
                make    = exif.get(271, "")   # Camera Make
                model   = exif.get(272, "")   # Camera Model
                soft    = exif.get(305, "")   # Software
                # Screenshot tools (Snipping Tool, ShareX, etc.)
                screen_tools = ["snip", "screenshot", "sharex", "lightshot",
                                 "paint", "mspaint", "snagit"]
                soft_lower   = str(soft).lower()
                if any(t in soft_lower for t in screen_tools):
                    risk += 0.40
                elif not make and not model and not soft:
                    risk += 0.20   # no device info at all

        elif ext == ".png":
            # PNG screenshots from Windows have specific chunk patterns
            data = open(path, "rb").read(512)
            if b"screenshot" in data.lower() or b"snip" in data.lower():
                risk += 0.45
            # PNGs with no tEXt chunks are often screenshots
            if b"tEXt" not in open(path, "rb").read():
                risk += 0.15

    except Exception:
        risk += 0.10   # can't read → slight penalty

    return round(min(risk, 1.0), 4)

# ── Check 4: Text Presence ────────────────────────────────────────────────────
def text_presence_score(img: Image.Image) -> float:
    """
    Estimate whether document-like text regions exist.
    Uses horizontal run-length patterns (text rows = alternating dark/light).
    Returns risk (0-1): high = no text detected.
    """
    grey  = np.array(img.convert("L"))
    # Threshold to binary
    binary = (grey < 128).astype(np.uint8)

    # Count rows that have significant dark pixels (text lines)
    row_dark = binary.mean(axis=1)   # per row fraction of dark pixels
    # Text rows: ~2-30% dark pixels (letters on white background)
    text_rows = ((row_dark > 0.01) & (row_dark < 0.50)).sum()
    text_ratio = text_rows / len(row_dark)

    # Low text_ratio → risky
    if text_ratio > 0.25:
        return 0.0    # lots of text rows → clearly a document
    elif text_ratio > 0.10:
        return 0.20
    elif text_ratio > 0.04:
        return 0.45
    else:
        return 0.80   # almost no text → photo / meme

# ── Combine into final score ──────────────────────────────────────────────────
WEIGHTS = {
    "manipulation": 0.35,
    "not_document":  0.30,
    "metadata":      0.20,
    "no_text":       0.15,
}

def analyse(path: str) -> dict:
    img = load_image(path)

    scores = {
        "manipulation": ela_score(img),
        "not_document":  document_score(img),
        "metadata":      metadata_score(path),
        "no_text":       text_presence_score(img),
    }

    final = sum(scores[k] * WEIGHTS[k] for k in scores)
    final = round(min(final, 1.0), 4)
    pct   = round(final * 100, 1)

    # Human-readable flags
    flags = []
    if scores["manipulation"] > 0.40:
        flags.append("Image manipulation detected (ELA)")
    if scores["not_document"] > 0.45:
        flags.append("Does not appear to be an official document")
    if scores["metadata"] > 0.35:
        flags.append("Screenshot or edited file signature in metadata")
    if scores["no_text"] > 0.50:
        flags.append("No significant text regions detected")
    if not flags:
        flags.append("No suspicious signals detected")

    # Recommendation
    if pct <= 30:
        level = "LOW"
        recommendation = "Likely Legitimate"
        color = "#22c55e"
    elif pct <= 55:
        level = "MEDIUM"
        recommendation = "Review Carefully"
        color = "#f59e0b"
    elif pct <= 75:
        level = "HIGH"
        recommendation = "Suspicious — Verify Manually"
        color = "#f97316"
    else:
        level = "VERY HIGH"
        recommendation = "Likely Fake or Invalid"
        color = "#ef4444"

    return {
        "riskScore":      pct,
        "riskLevel":      level,
        "recommendation": recommendation,
        "color":          color,
        "breakdown": {
            "manipulation": round(scores["manipulation"] * 100, 1),
            "notDocument":  round(scores["not_document"]  * 100, 1),
            "metadata":     round(scores["metadata"]      * 100, 1),
            "noText":       round(scores["no_text"]       * 100, 1),
        },
        "flags": flags,
    }

# ─── Routes ───────────────────────────────────────────────────────────────────

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "MyanVolunteer Document Analyzer"})

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.get_json()
    if not data or "filePath" not in data:
        return jsonify({"error": "filePath required"}), 400

    path = data["filePath"]
    if not os.path.exists(path):
        return jsonify({"error": f"File not found: {path}"}), 404

    ext = os.path.splitext(path)[1].lower()
    if ext not in (".jpg", ".jpeg", ".png", ".webp", ".bmp"):
        return jsonify({"error": "Unsupported file type"}), 400

    try:
        result = analyse(path)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    print("🔍 Document Analyzer running on http://localhost:5001")
    app.run(host="0.0.0.0", port=5001, debug=False)
