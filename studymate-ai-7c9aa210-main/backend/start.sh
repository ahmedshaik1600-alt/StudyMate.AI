#!/bin/bash
# StudyMate AI — Backend Startup Script
# Run this from inside the backend/ folder

set -e

echo "======================================"
echo "  StudyMate AI — FastAPI Backend"
echo "======================================"

# Check Python
if ! command -v python3 &>/dev/null; then
  echo "❌ Python 3 not found. Please install Python 3.10+"
  exit 1
fi

# Create venv if it doesn't exist
if [ ! -d "venv" ]; then
  echo "📦 Creating virtual environment..."
  python3 -m venv venv
fi

# Activate venv
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -q -r requirements.txt

# Check for .env
if [ ! -f ".env" ]; then
  echo ""
  echo "⚠️  No .env file found!"
  echo "   Copy .env.example → .env and add your GEMINI_API_KEY"
  echo ""
  echo "   cp .env.example .env"
  echo "   Then edit .env and add your key from:"
  echo "   https://aistudio.google.com/app/apikey"
  echo ""
  exit 1
fi

echo ""
echo "✅ Starting server at http://localhost:8000"
echo "   API docs: http://localhost:8000/docs"
echo ""

# Load .env and start server
export $(grep -v '^#' .env | xargs)
uvicorn main:app --reload --host 0.0.0.0 --port 8000
