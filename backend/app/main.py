from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from data.companies import companies
from data.questions import questions
from rag.rag_pipeline import RAGPipeline
from app.resume_analyzer import ResumeAnalyzer

app = FastAPI(
    title="InterviewIQ API",
    description="AI-powered company-specific interview preparation API",
    version="1.0.0"
)
rag_pipeline = RAGPipeline()
resume_analyzer = ResumeAnalyzer()

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


@app.post("/api/resume/analyze")
async def analyze_resume(
    resume: UploadFile = File(...),
    company: str = Form(...),
    role: str = Form(...)
):
    if not company or not company.strip():
        raise HTTPException(
            status_code=400,
            detail="Company name is required."
        )

    if not role or not role.strip():
        raise HTTPException(
            status_code=400,
            detail="Target role is required."
        )

    if not resume.filename or not resume.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported."
        )

    try:
        pdf_bytes = await resume.read()

        if len(pdf_bytes) == 0:
            raise HTTPException(
                status_code=400,
                detail="Uploaded file is empty."
            )

        result = resume_analyzer.analyze(
            pdf_bytes=pdf_bytes,
            company=company.strip(),
            role=role.strip()
        )

        return result

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except Exception as e:
        print(f"Resume analysis error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Resume analysis failed. Please try again."
        )


    