from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from data.companies import companies
from data.questions import questions

app = FastAPI(
    title="InterviewIQ API",
    description="AI-powered company-specific interview preparation API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "message": "InterviewIQ backend is running!"
    }

@app.get("/api/health")
def health():
    return {
        "status": "healthy"
    }

@app.get("/api/companies")
def get_companies():
    return companies

@app.get("/api/questions")
def get_questions():
    return questions