from flask import Flask, request, jsonify, send_file, render_template
from datetime import datetime
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv
from pypdf import PdfReader
from reportlab.platypus import SimpleDocTemplate, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
import os
# =========================
# Load Environment
# =========================

load_dotenv()

app = Flask(__name__)
CORS(app)
os.makedirs('instance', exist_ok=True)


# =========================
# Gemini Setup
# =========================

genai.configure(
    api_key=os.getenv("GEMINI_API_KEY")
)

model = genai.GenerativeModel(
    "gemini-2.5-flash"
)

# =========================
# Global Variables
# =========================

pdf_text = ""
latest_notes = ""

stats = {
    "chat": 0,
    "notes": 0,
    "quiz": 0,
    "pdf": 0
}
activities = []

# =========================
# Home Route
# =========================
# =========================
# Home Route
# =========================

@app.route('/')
def home():
    return render_template('dashboard.html')



# =========================
# AI Professor Chat
# =========================

@app.route('/chat', methods=['POST'])
def chat():

    try:

        data = request.json

        stats["chat"] += 1
        activities.insert(
        0,
            {
                "activity": f"🤖 Asked AI: {data['message'][:30]}",
                "time": datetime.now().strftime("%I:%M %p")
    }
)
        activities[:] = activities[:10]

        response = model.generate_content(
            f"""
You are AI Professor, a modern educational assistant.

Rules:
- Answer like a friendly professor.
- Keep greetings short.
- Explain study topics clearly.
- Use bullet points.
- Give examples.
- Keep answers under 300 words unless requested.
- Be student-friendly.

Student Question:
{data['message']}
"""
        )

        return jsonify({
            "reply": response.text
        })

    except Exception as e:

        return jsonify({
            "reply": str(e)
        })


# =========================
# Notes Generator
# =========================
# =========================
# Notes Generator
# =========================

@app.route('/notes', methods=['POST'])
def notes():

    global latest_notes

    try:

        data = request.json
        stats["notes"] += 1
        activities.insert(
            0,
    {
        "activity":
            f"📚 Generated notes: {data['topic']}",
        "time":
            datetime.now().strftime("%I:%M %p")
    }
)
        activities[:] = activities[:10]

        response = model.generate_content(
            f"""
Create study notes.

Topic:
{data['topic']}

Difficulty:
{data['level']}

Length:
{data['length']}

Requirements:
- Title
- Definition
- Important Concepts
- Examples
- Applications
- Summary
- Use bullet points
- Make notes student friendly.
"""
        )

        latest_notes = response.text

        return jsonify({
            "notes": response.text
        })

    except Exception as e:

        return jsonify({
            "notes": str(e)
        })

# =========================
# Quiz Generator
# =========================

@app.route('/quiz', methods=['POST'])
def quiz():

    try:

        data = request.json

        stats["quiz"] += 1
        activities.insert(
            0,
            {
                "activity": f"📝 Generated quiz: {data['topic']}",
                "time": datetime.now().strftime("%I:%M %p")
            }
        )
        activities[:] = activities[:10]

        response = model.generate_content(
            f"""
Generate a multiple choice quiz.

Topic:
{data['topic']}

Difficulty:
{data['level']}

Number of Questions:
{data['count']}

Rules:
- Generate MCQs.
- Provide four options.
- Mark the correct answer.
- Keep questions educational.
"""
        )

        return jsonify({
            "quiz": response.text
        })

    except Exception as e:

        return jsonify({
            "quiz": str(e)
        })


# =========================
# Upload PDF
# =========================

@app.route('/upload_pdf', methods=['POST'])
def upload_pdf():

    global pdf_text

    try:

        if 'file' not in request.files:

            return jsonify({
                "message": "No file selected"
            })

        stats["pdf"] += 1

        file = request.files['file']
        activities.insert(
        0,
    {
        "activity":
            f"📄 Uploaded: {file.filename}",
        "time":
            datetime.now().strftime("%I:%M %p")
    }
)
        activities[:] = activities[:10]

        reader = PdfReader(file)

        pdf_text = ""

        for page in reader.pages:

            text = page.extract_text()

            if text:
                pdf_text += text

        return jsonify({
            "message": "PDF uploaded successfully"
        })

    except Exception as e:

        return jsonify({
            "message": str(e)
        })


# =========================
# Ask PDF
# =========================

@app.route('/ask_pdf', methods=['POST'])
def ask_pdf():

    global pdf_text

    try:

        if pdf_text == "":

            return jsonify({
                "answer": "Please upload a PDF first."
            })

        data = request.json

        response = model.generate_content(
            f"""
You are an expert university professor.

Answer ONLY using the uploaded PDF.

PDF Content:
{pdf_text[:50000]}

Question:
{data['question']}
"""
        )

        return jsonify({
            "answer": response.text
        })

    except Exception as e:

        return jsonify({
            "answer": str(e)
        })


# =========================
# Progress Tracker
# =========================

@app.route('/progress')
def progress():

    return jsonify({
        "chat": stats["chat"],
        "notes": stats["notes"],
        "quiz": stats["quiz"],
        "pdf": stats["pdf"]
    })


# =========================
# Download Notes PDF
# =========================
@app.route('/download_notes')
def download_notes():

    global latest_notes

    try:

        if latest_notes == "":

            return jsonify({
                "message":
                "Generate notes first."
            })

        doc = SimpleDocTemplate(
            "notes.pdf"
        )

        styles = getSampleStyleSheet()

        story = []

        story.append(
            Paragraph(
                latest_notes,
                styles['Normal']
            )
        )

        doc.build(story)

        return send_file(
            "notes.pdf",
            as_attachment=True
        )

    except Exception as e:

        return jsonify({
            "message":
            str(e)
        })
@app.route('/activities')
def get_activities():

    return jsonify({
        "activities": activities
    })

# =========================
# Run Server
# =========================
if __name__ == "__main__":

    app.run(
    host="0.0.0.0",
    port=5000,
    debug=True
)