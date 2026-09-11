# InterviewIQ

An AI-powered, company-specific interview preparation platform. Instead of generic advice, InterviewIQ pulls **real interview reports, official hiring docs, and job descriptions** for a specific company via live web search, then uses a RAG pipeline to generate evidence-grounded preparation material, practice questions with AI evaluation, and ATS resume analysis.

---

## What It Does

| Feature | What the user gets |
|---|---|
| **Company-Specific Preparation** | Select any company (or type any company name). InterviewIQ researches that company's actual interview process, identifies rounds, topics, and confidence levels — all backed by cited web sources. |
| **AI Practice Engine** | Get company-specific practice questions (coding, technical, behavioral) grounded in real interview reports. Answer via text or speech-to-text; receive an AI evaluation with score, strengths, missing concepts, and ideal answer points. |
| **Resume ATS Analyzer** | Upload a PDF resume. InterviewIQ researches the target company's requirements, then produces an ATS compatibility score, keyword analysis, line-by-line improvement suggestions, and a final verdict. |
| **RAG Chat** | Ask any question about a company's interview process and get a sourced answer (not a hallucinated one). |

---

## Architecture

```
frontend/                        backend/
┌──────────────────────┐        ┌──────────────────────────────────────┐
│  React + Vite + TS   │        │           FastAPI (Python)           │
│  Tailwind CSS v4     │◄──────►│                                      │
│  shadcn/ui           │  REST  │  ┌──────────┐   ┌─────────────────┐  │
│                      │        │  │  Tavily   │   │  FAISS + fast   │  │
│  PreparationPage     │        │  │  Web      │   │  embed vector   │  │
│  ResumePage          │        │  │  Search   │   │  store          │  │
│  LandingPage         │        │  └────┬─────┘   └───────┬─────────┘  │
└──────────────────────┘        │       │                  │            │
                                │       ▼                  ▼            │
                                │  ┌──────────────────────────────┐    │
                                │  │      RAG Pipeline            │    │
                                │  │  source_processor → retrieve  │    │
                                │  │  live → fallback FAISS →      │    │
                                │  │  context → Gemini LLM         │    │
                                │  └──────────────────────────────┘    │
                                └──────────────────────────────────────┘
```

**Every AI feature follows the same pattern:**
1. Tavily searches the web for company-specific interview evidence
2. Sources are classified (official / reported / job_description), deduplicated, and quality-filtered
3. Semantic retrieval ranks sources by 75% cosine similarity + 25% authority score
4. If no live results → fallback to pre-built local FAISS index (Sprinklr data)
5. Retrieved context is built into an evidence-grounded prompt
6. Gemini generates the response (with retry handling for transient 503/429 errors)

---

## Tech Stack

**Backend** — `backend/`
| Component | Technology |
|---|---|
| API Framework | FastAPI + Uvicorn |
| LLM | Google Gemini (`gemini-3.6-flash`) via `google-genai` SDK |
| Vector Search | FAISS (`faiss-cpu`) |
| Embeddings | `fastembed` / `sentence-transformers` (`all-MiniLM-L6-v2`, 384-dim) |
| Web Search | Tavily API |
| PDF Parsing | `pypdf` |
| Web Scraping | `beautifulsoup4` + `requests` |

**Frontend** — `frontend/`
| Component | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build Tool | Vite 6 |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui (40+ Radix primitives) |
| Charts | Recharts |
| Speech-to-Text | Web Speech API (browser native) |
| Icons | Lucide React |

---

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py              ← FastAPI app, all endpoints
│   │   └── resume_analyzer.py   ← Resume PDF → ATS analysis pipeline
│   ├── rag/
│   │   ├── rag_pipeline.py      ← Central RAG orchestrator
│   │   ├── retriever.py         ← FAISS + live semantic retrieval
│   │   ├── llm.py               ← Gemini client with retry logic
│   │   ├── prompts.py           ← All prompt templates
│   │   ├── context_builder.py   ← Formats retrieval results for LLM
│   │   ├── source_loader.py     ← URL → clean text (HTML scraping)
│   │   └── ingest.py            ← Standalone: build FAISS index from URLs
│   ├── web/
│   │   ├── search.py            ← Tavily web search wrapper
│   │   └── source_processor.py  ← Source classification & deduplication
│   ├── data/
│   │   ├── companies.py         ← Static company metadata (7 companies)
│   │   ├── sources.py           ← Seed URLs for ingestion
│   │   └── vector_store/        ← Pre-built FAISS index + metadata
│   ├── requirements.txt
│   └── .env                     ← GEMINI_API_KEY, TAVILY_API_KEY
│
├── frontend/
│   ├── src/
│   │   ├── app/App.tsx          ← All pages (single-file SPA)
│   │   ├── api.ts               ← API client functions
│   │   └── styles/              ← Tailwind config, fonts, theme
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

---

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- A **Google Gemini API key** — [get one here](https://aistudio.google.com/apikey)
- A **Tavily API key** — [get one here](https://tavily.com)

### 1. Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Add your API keys
cp .env.example .env       # or create .env manually
# Edit .env and add:
#   GEMINI_API_KEY=your_gemini_key
#   TAVILY_API_KEY=your_tavily_key

# Start the server
uvicorn app.main:app --reload --port 8000
```

The API runs at `http://localhost:8000`. Swagger docs are at `http://localhost:8000/docs`.

### 2. Frontend

```bash
cd frontend

npm install

# Set the backend URL
echo "VITE_API_URL=http://localhost:8000" > .env

npm run dev
```

The app runs at `http://localhost:5173`.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/companies` | List of companies with interview metadata |
| `POST` | `/api/rag/ask` | RAG-powered Q&A about a company's interviews |
| `POST` | `/api/interview-intelligence` | Full interview intelligence report (rounds, topics, confidence) |
| `POST` | `/api/resume/analyze` | Upload PDF resume → ATS score, keywords, suggestions |
| `POST` | `/api/practice/generate` | Generate N company-specific practice questions |
| `POST` | `/api/practice/evaluate` | Evaluate a user's answer (score 1-10 + feedback) |

All `POST` endpoints accept JSON (except `/api/resume/analyze` which accepts `multipart/form-data` with a PDF file).

---

## How the RAG Pipeline Works

```
User question / company name
        │
        ▼
┌─────────────────────────────┐
│  Tavily Web Search          │  7 targeted queries per company
│  (7 searches × 10 results) │  covering interview experiences, OA,
└─────────────┬───────────────┘  hiring process, HR questions...
              │
              ▼
┌─────────────────────────────┐
│  Source Processor           │  Dedup by URL
│  - Quality filter           │  Filter low-quality domains
│  - Domain classification    │  Classify: official / reported / job_desc
│  - Authority scoring        │  Assign weights: 1.0 / 0.85 / 0.75 / 0.40
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│  Live Semantic Retrieval    │  Embed query + all sources
│  (fastembed, MiniLM-L6)    │  Score = 75% similarity + 25% authority
└─────────────┬───────────────┘
              │
         ┌────┴────┐
         │ Results? │
         └────┬────┘
              │
     Yes      │      No
     ┌────────┴────────┐
     ▼                  ▼
┌──────────┐   ┌────────────────┐
│ Use live │   │ Fallback to    │
│ sources  │   │ local FAISS    │
└────┬─────┘   └───────┬────────┘
     └────────┬────────┘
              ▼
┌─────────────────────────────┐
│  Context Builder            │  Format sources into structured text
│  + Prompt Template          │  Company-specific prompt with instructions
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│  Gemini LLM                 │  Generates evidence-grounded response
│  (with retry on 503/429)   │  with 3 retries + exponential backoff
└─────────────────────────────┘
```

---

## The Practice Engine

The practice engine generates company-specific questions grounded in real interview evidence, not generic templates.

**Question types:**
- **Coding** — DSA problems reported by actual candidates at that company, with company-specific hints and expected approach
- **Technical** — Conceptual questions (DBMS, OS, networking) based on what the company actually asks
- **Behavioral** — Questions based on the company's known interview style (e.g., Amazon Leadership Principles)

**Evaluation provides:**
- Score (1-10)
- Strengths and specific areas for improvement
- Missing concepts
- Ideal answer points
- For coding questions: time/space complexity analysis

---

## The Resume ATS Analyzer

Uploads a PDF resume and produces:

| Output | What it means |
|---|---|
| **ATS Score** (0-100) | Estimated compatibility with the company's applicant tracking system |
| **Score Breakdown** | keyword_match / technical_alignment / role_alignment / responsibility_alignment / clarity / relevance |
| **Matched Keywords** | Skills/keywords found in your resume that match the role |
| **Missing Keywords** | Important keywords absent from your resume (with importance and reason) |
| **Line-by-Line Suggestions** | Section-by-section improvements with original text, suggested rewrite, reason, and impact |
| **Company Recommendations** | Specific to the target company's requirements |
| **Final Verdict** | Plain-English summary of your resume's fit |

> **Note:** All scores are AI-estimated, not actual ATS scores. Use as a directional guide.

---

## Adding More Companies

The preparation page supports **any company name** — just select "Other / Enter Company" from the dropdown and type the name. The RAG pipeline will research it live via Tavily web search.

To add a company to the dropdown with pre-built interview metadata (rounds, topics, eligibility), edit `backend/data/companies.py` and add an entry following the existing schema.

To add pre-built FAISS index data for a company, edit `backend/data/sources.py` with the company's career page URLs and interview report URLs, then run:

```bash
cd backend
python -m rag.ingest
```

This fetches the URLs, chunks the content, builds embeddings, and saves to `data/vector_store/`.

---

## Built With

- **FastAPI** — async backend framework
- **Google Gemini** — LLM for evidence-grounded generation
- **Tavily** — real-time web search for interview evidence
- **FAISS** — vector similarity search for local RAG fallback
- **fastembed / sentence-transformers** — lightweight embedding model (`all-MiniLM-L6-v2`)
- **React + Vite + Tailwind CSS** — frontend stack
- **shadcn/ui** — accessible UI components
