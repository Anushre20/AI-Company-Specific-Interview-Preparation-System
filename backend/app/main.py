from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from data.companies import companies
from data.questions import questions
from rag.rag_pipeline import RAGPipeline

app = FastAPI(
    title="InterviewIQ API",
    description="AI-powered company-specific interview preparation API",
    version="1.0.0"
)
rag_pipeline = RAGPipeline()

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

class RAGRequest(BaseModel):
    question: str
    company: str | None = None
    role: str | None = None
    source_type: str | None = None
    top_k: int = 3

class InterviewIntelligenceRequest(BaseModel):
    company: str
    role: str | None = None
    top_k: int = 10

@app.post("/api/rag/ask")
def ask_rag(request: RAGRequest):

    result = rag_pipeline.ask(
        question=request.question,
        company=request.company,
        role=request.role,
        source_type=request.source_type,
        top_k=request.top_k
    )

    return result

@app.post("/api/interview-intelligence")
def interview_intelligence(
    request: InterviewIntelligenceRequest
):

    result = rag_pipeline.analyze_interview_process(
        company=request.company,
        role=request.role,
        top_k=request.top_k
    )

    return result


    