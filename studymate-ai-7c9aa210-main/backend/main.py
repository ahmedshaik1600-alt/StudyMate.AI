"""
StudyMate AI — FastAPI Backend
Uses Gemini 2.5 Flash for all AI generation.
"""

import os
import io
import json
import textwrap
from datetime import datetime
from typing import Optional

import google.generativeai as genai
from fastapi import FastAPI, File, UploadFile, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()  # Load .env file automatically

# ── PDF generation ────────────────────────────────────────────────────────────
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib.colors import HexColor
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from reportlab.lib.enums import TA_LEFT, TA_CENTER

# ── Text extraction ───────────────────────────────────────────────────────────
import PyPDF2
import docx

# ─────────────────────────────────────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────────────────────────────────────

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

MODEL_NAME = "gemini-2.5-flash-lite"

app = FastAPI(title="StudyMate AI Backend", version="1.0.0")

# Allow all origins for local development.
# allow_credentials must be False when allow_origins=["*"].
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Explicit OPTIONS handler — catches any preflight the middleware misses
@app.options("/{rest_of_path:path}")
async def preflight_handler(rest_of_path: str, request: Request):
    return JSONResponse(
        content={},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        },
    )

# ─────────────────────────────────────────────────────────────────────────────
# PYDANTIC MODELS
# ─────────────────────────────────────────────────────────────────────────────

class SummarizeRequest(BaseModel):
    text: str
    length: str = "Medium"        # Short | Medium | Detailed
    style: str = "Exam"           # Exam | Concept | Bullet | Quick
    difficulty: str = "Intermediate"  # Beginner | Intermediate | Advanced

class FlashcardsRequest(BaseModel):
    text: str
    difficulty: str = "Intermediate"
    count: int = 6

class QuizRequest(BaseModel):
    text: str
    count: int = 5
    difficulty: str = "Intermediate"

class SimplifyRequest(BaseModel):
    text: str
    level: str = "Very Easy"  # Very Easy | School Level | College Level

class TTSRequest(BaseModel):
    text: str
    voice: str = "Natural Female"
    speed: str = "1x"

class RegenerateRequest(BaseModel):
    mode: str          # summary | flashcards | quiz | simplify
    text: str
    settings: dict = {}

class DownloadSummaryRequest(BaseModel):
    summary: dict      # The full summary JSON object from /summarize

# ─────────────────────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────────────────────

def get_model():
    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY environment variable not set. Add it to your .env file."
        )
    return genai.GenerativeModel(MODEL_NAME)


def call_gemini(prompt: str) -> str:
    """Call Gemini and return raw text response."""
    model = get_model()
    response = model.generate_content(prompt)
    return response.text.strip()


def parse_json_response(raw: str) -> dict | list:
    """Strip markdown fences and parse JSON from Gemini response."""
    cleaned = raw.strip()
    if cleaned.startswith("```"):
        # Remove first line (```json or ```) and last line (```)
        lines = cleaned.split("\n")
        cleaned = "\n".join(lines[1:-1])
    return json.loads(cleaned)


def extract_text_from_file(file: UploadFile, content: bytes) -> str:
    """Extract plain text from PDF, DOCX, or TXT upload."""
    name = (file.filename or "").lower()

    if name.endswith(".pdf"):
        reader = PyPDF2.PdfReader(io.BytesIO(content))
        pages = [page.extract_text() or "" for page in reader.pages]
        return "\n".join(pages)

    if name.endswith(".docx"):
        doc = docx.Document(io.BytesIO(content))
        return "\n".join(p.text for p in doc.paragraphs)

    # Fallback: plain text
    return content.decode("utf-8", errors="ignore")


def human_size(n: int) -> str:
    for unit in ("B", "KB", "MB", "GB"):
        if n < 1024:
            return f"{n:.1f} {unit}"
        n /= 1024
    return f"{n:.1f} GB"


# ─────────────────────────────────────────────────────────────────────────────
# PDF GENERATION (for Download Summary)
# ─────────────────────────────────────────────────────────────────────────────

PRIMARY   = HexColor("#a80707")   # StudyMate red
DARK_BG   = HexColor("#1a1a1a")
LIGHT_TXT = HexColor("#333333")
MUTED     = HexColor("#666666")
BULLET_CLR = HexColor("#a80707")


def build_summary_pdf(summary: dict) -> bytes:
    """Render a summary dict → PDF bytes using ReportLab."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=2.5 * cm,
        rightMargin=2.5 * cm,
        topMargin=2.5 * cm,
        bottomMargin=2.5 * cm,
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        "SummaryTitle",
        parent=styles["Title"],
        fontSize=22,
        leading=28,
        textColor=PRIMARY,
        spaceAfter=4,
    )
    meta_style = ParagraphStyle(
        "Meta",
        parent=styles["Normal"],
        fontSize=9,
        textColor=MUTED,
        spaceAfter=2,
    )
    badge_style = ParagraphStyle(
        "Badge",
        parent=styles["Normal"],
        fontSize=9,
        textColor=PRIMARY,
        spaceAfter=12,
    )
    section_heading_style = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        fontSize=13,
        leading=18,
        textColor=LIGHT_TXT,
        spaceBefore=16,
        spaceAfter=6,
        fontName="Helvetica-Bold",
    )
    bullet_style = ParagraphStyle(
        "Bullet",
        parent=styles["Normal"],
        fontSize=10,
        leading=15,
        leftIndent=12,
        textColor=LIGHT_TXT,
        spaceAfter=4,
    )
    takeaway_style = ParagraphStyle(
        "Takeaway",
        parent=styles["Normal"],
        fontSize=10,
        leading=15,
        leftIndent=12,
        textColor=LIGHT_TXT,
        spaceAfter=3,
    )
    takeaway_heading_style = ParagraphStyle(
        "TakeawayHeading",
        parent=styles["Heading2"],
        fontSize=12,
        textColor=PRIMARY,
        spaceBefore=16,
        spaceAfter=6,
        fontName="Helvetica-Bold",
    )
    footer_style = ParagraphStyle(
        "Footer",
        parent=styles["Normal"],
        fontSize=8,
        textColor=MUTED,
        alignment=TA_CENTER,
    )

    story = []

    # ── Title ─────────────────────────────────────────────────────────────────
    title = summary.get("title", "AI Study Summary")
    story.append(Paragraph(title, title_style))

    # ── Meta line ─────────────────────────────────────────────────────────────
    generated_at = summary.get("generatedAt", datetime.utcnow().isoformat())
    try:
        dt = datetime.fromisoformat(generated_at.replace("Z", "+00:00"))
        date_str = dt.strftime("%B %d, %Y at %H:%M UTC")
    except Exception:
        date_str = generated_at

    summary_type = summary.get("type", "AI-Generated")
    difficulty   = summary.get("difficulty", "")
    story.append(Paragraph(f"Generated: {date_str}", meta_style))
    story.append(Paragraph(f"Type: {summary_type}  ·  Difficulty: {difficulty}", meta_style))
    story.append(Paragraph("★ AI Generated  ·  StudyMate AI", badge_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=8))

    # ── Sections ──────────────────────────────────────────────────────────────
    sections = summary.get("sections", [])
    for section in sections:
        heading = section.get("heading", "")
        story.append(Paragraph(heading, section_heading_style))
        for bullet in section.get("bullets", []):
            story.append(Paragraph(f"• &nbsp; {bullet}", bullet_style))

    # ── Quick Takeaways ───────────────────────────────────────────────────────
    takeaways = summary.get("quickTakeaways", [])
    if takeaways:
        story.append(Spacer(1, 8))
        story.append(HRFlowable(width="100%", thickness=0.5, color=MUTED, spaceAfter=4))
        story.append(Paragraph("💡 Quick Takeaways", takeaway_heading_style))
        for t in takeaways:
            story.append(Paragraph(f"• &nbsp; {t}", takeaway_style))

    # ── Footer ────────────────────────────────────────────────────────────────
    story.append(Spacer(1, 20))
    story.append(HRFlowable(width="100%", thickness=0.5, color=MUTED, spaceAfter=6))
    story.append(Paragraph("Generated by StudyMate AI · studymate.ai", footer_style))

    doc.build(story)
    buffer.seek(0)
    return buffer.read()


# ─────────────────────────────────────────────────────────────────────────────
# ROUTES
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "StudyMate AI backend running", "model": MODEL_NAME}


@app.get("/health")
def health():
    return {"ok": True, "gemini_configured": bool(GEMINI_API_KEY)}


# ── Upload ────────────────────────────────────────────────────────────────────

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """Accept a PDF / DOCX / TXT file and return extracted text + metadata."""
    content = await file.read()
    size_str = human_size(len(content))
    file_type = (file.filename or "").rsplit(".", 1)[-1].upper()

    try:
        extracted_text = extract_text_from_file(file, content)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Could not extract text: {e}")

    if not extracted_text.strip():
        raise HTTPException(status_code=422, detail="File appears to be empty or unreadable.")

    return {
        "id": str(int(datetime.utcnow().timestamp() * 1000)),
        "name": file.filename,
        "type": file_type,
        "size": size_str,
        "status": "ready",
        "extractedText": extracted_text,
        "wordCount": len(extracted_text.split()),
    }


# ── Summarize ─────────────────────────────────────────────────────────────────

@app.post("/summarize")
async def summarize(req: SummarizeRequest):
    length_map = {
        "Short":    "3-4 short bullet points per section, max 2 sections",
        "Medium":   "4-6 bullet points per section, 3 sections",
        "Detailed": "6-8 bullet points per section, 4-5 sections",
    }
    length_instruction = length_map.get(req.length, length_map["Medium"])

    prompt = f"""
You are an expert academic summarizer. Summarize the following study material.

RULES:
- Output ONLY valid JSON, no markdown fences, no extra text.
- Style: {req.style} (Exam = exam-focused key points, Concept = deep understanding, Bullet = short bullets, Quick = ultra-brief)
- Difficulty level: {req.difficulty}
- Length: {length_instruction}
- Extract a meaningful title from the content.

OUTPUT FORMAT (strict JSON):
{{
  "title": "...",
  "generatedAt": "{datetime.utcnow().isoformat()}Z",
  "type": "{req.style}-focused",
  "difficulty": "{req.difficulty}",
  "sections": [
    {{
      "heading": "Section heading here",
      "bullets": ["bullet 1", "bullet 2", "bullet 3"]
    }}
  ],
  "quickTakeaways": ["takeaway 1", "takeaway 2", "takeaway 3", "takeaway 4"]
}}

STUDY MATERIAL:
{req.text[:12000]}
"""
    raw = call_gemini(prompt)
    try:
        data = parse_json_response(raw)
    except Exception:
        raise HTTPException(status_code=500, detail="Gemini returned invalid JSON. Try again.")
    return data


# ── Flashcards ────────────────────────────────────────────────────────────────

@app.post("/flashcards")
async def flashcards(req: FlashcardsRequest):
    prompt = f"""
You are a study flashcard creator. Create {req.count} flashcards from the study material below.

RULES:
- Output ONLY valid JSON, no markdown fences, no extra text.
- Difficulty level: {req.difficulty}
- Mix beginner, intermediate, and advanced cards based on the difficulty setting.
- Questions should be specific, clear, and test real understanding.

OUTPUT FORMAT (strict JSON):
{{
  "cards": [
    {{
      "id": 1,
      "question": "...",
      "answer": "...",
      "difficulty": "Beginner"
    }}
  ]
}}

STUDY MATERIAL:
{req.text[:12000]}
"""
    raw = call_gemini(prompt)
    try:
        data = parse_json_response(raw)
    except Exception:
        raise HTTPException(status_code=500, detail="Gemini returned invalid JSON. Try again.")
    return data


# ── Quiz ──────────────────────────────────────────────────────────────────────

@app.post("/quiz")
async def quiz(req: QuizRequest):
    prompt = f"""
You are a quiz generator. Create {req.count} multiple-choice quiz questions from the study material below.

RULES:
- Output ONLY valid JSON, no markdown fences, no extra text.
- Difficulty: {req.difficulty}
- Each question must have exactly 4 options.
- correctIndex is 0-based (0, 1, 2, or 3).
- Explanation should be clear and educational.

OUTPUT FORMAT (strict JSON):
{{
  "questions": [
    {{
      "id": 1,
      "question": "...",
      "options": ["option A", "option B", "option C", "option D"],
      "correctIndex": 1,
      "explanation": "..."
    }}
  ]
}}

STUDY MATERIAL:
{req.text[:12000]}
"""
    raw = call_gemini(prompt)
    try:
        data = parse_json_response(raw)
    except Exception:
        raise HTTPException(status_code=500, detail="Gemini returned invalid JSON. Try again.")
    return data


# ── Simplify ──────────────────────────────────────────────────────────────────

@app.post("/simplify")
async def simplify(req: SimplifyRequest):
    level_map = {
        "Very Easy":    "Explain like I'm 10 years old. Use simple everyday words, analogies, and emoji to make it fun and memorable. Max 10 bullets.",
        "School Level": "Explain for a high school student. Clear and accessible but academically appropriate. Max 12 bullets.",
        "College Level": "Explain for a college student who is new to this topic. Use correct terminology but explain each term. Max 14 bullets.",
    }
    level_instruction = level_map.get(req.level, level_map["Very Easy"])

    prompt = f"""
You are a note simplification expert. Simplify the following study material.

RULES:
- Output ONLY valid JSON, no markdown fences, no extra text.
- {level_instruction}
- Start each bullet with a relevant emoji.
- Each bullet should be one clear, standalone idea.
- Extract a title from the content.

OUTPUT FORMAT (strict JSON):
{{
  "title": "Topic Name — Simplified",
  "level": "{req.level}",
  "bullets": [
    "🔑 First key idea explained simply",
    "📌 Second key idea",
    "💡 Third key idea"
  ]
}}

STUDY MATERIAL:
{req.text[:12000]}
"""
    raw = call_gemini(prompt)
    try:
        data = parse_json_response(raw)
    except Exception:
        raise HTTPException(status_code=500, detail="Gemini returned invalid JSON. Try again.")
    return data


# ── TTS (Web Speech API fallback — returns text) ───────────────────────────────

@app.post("/tts")
async def tts(req: TTSRequest):
    """
    Returns the text to be spoken. The frontend uses the Web Speech API
    to synthesise it client-side (no TTS API key required).
    For production, swap this with ElevenLabs or OpenAI TTS.
    """
    speed_map = {"0.5x": 0.5, "0.75x": 0.75, "1x": 1.0, "1.25x": 1.25, "1.5x": 1.5, "2x": 2.0}
    return {
        "text": req.text,
        "voice": req.voice,
        "rate": speed_map.get(req.speed, 1.0),
    }


# ── Regenerate ────────────────────────────────────────────────────────────────

@app.post("/regenerate")
async def regenerate(req: RegenerateRequest):
    """Route to the correct generation endpoint with a fresh prompt."""
    settings = req.settings

    if req.mode == "summary":
        return await summarize(SummarizeRequest(
            text=req.text,
            length=settings.get("length", "Medium"),
            style=settings.get("style", "Exam"),
            difficulty=settings.get("difficulty", "Intermediate"),
        ))

    if req.mode == "flashcards":
        return await flashcards(FlashcardsRequest(
            text=req.text,
            difficulty=settings.get("difficulty", "Intermediate"),
            count=settings.get("count", 6),
        ))

    if req.mode == "quiz":
        return await quiz(QuizRequest(
            text=req.text,
            count=settings.get("count", 5),
            difficulty=settings.get("difficulty", "Intermediate"),
        ))

    if req.mode == "simplify":
        return await simplify(SimplifyRequest(
            text=req.text,
            level=settings.get("level", "Very Easy"),
        ))

    raise HTTPException(status_code=400, detail=f"Unknown mode: {req.mode}")


# ── Download Summary as PDF ───────────────────────────────────────────────────

@app.post("/download/summary")
async def download_summary(req: DownloadSummaryRequest):
    """
    Accepts a summary JSON object, renders it as a styled PDF,
    and streams it back as a file download.
    """
    try:
        pdf_bytes = build_summary_pdf(req.summary)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {e}")

    title = req.summary.get("title", "summary")
    # Sanitise filename
    safe_title = "".join(c if c.isalnum() or c in " -_" else "_" for c in title)
    safe_title = safe_title.strip().replace(" ", "_")[:60]
    filename = f"StudyMate_{safe_title}.pdf"

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )