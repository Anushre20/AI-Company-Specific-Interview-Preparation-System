import sys
import json
import io
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

from pypdf import PdfReader
from rag.retriever import InterviewRetriever
from web.search import WebSearch
from web.source_processor import SourceProcessor
from rag.context_builder import build_context
from rag.prompts import ATS_RESUME_ANALYSIS_PROMPT
from rag.llm import generate_answer


class ResumeAnalyzer:

    def __init__(self):
        self.retriever = InterviewRetriever()
        self.web_search = WebSearch()
        self.source_processor = SourceProcessor()

    def extract_text_from_pdf(self, pdf_bytes: bytes) -> str:
        reader = PdfReader(io.BytesIO(pdf_bytes))

        pages_text = []

        for page in reader.pages:
            text = page.extract_text()
            if text and text.strip():
                pages_text.append(text.strip())

        full_text = "\n\n".join(pages_text)

        if not full_text.strip():
            raise ValueError(
                "No extractable text found in the PDF. "
                "The file may be image-based or corrupted."
            )

        return full_text

    def search_job_requirements(self, company: str, role: str):
        queries = [
            f"{company} {role} job description requirements",
            f"{company} {role} skills qualifications",
            f"{company} {role} job posting responsibilities",
            f"{company} engineering team hiring requirements",
            f"{company} careers {role} role",
        ]

        all_results = []

        for query in queries:
            print(f"\nATS Research: {query}")

            response = self.web_search.client.search(
                query=query,
                search_depth="advanced",
                max_results=5,
                include_raw_content=True
            )

            results = response.get("results", [])

            for result in results:
                all_results.append({
                    "query": query,
                    "title": result.get("title"),
                    "url": result.get("url"),
                    "content": result.get("content"),
                    "raw_content": result.get("raw_content"),
                    "score": result.get("score")
                })

        return all_results

    def analyze(self, pdf_bytes: bytes, company: str, role: str):

        # 1. Extract resume text
        resume_text = self.extract_text_from_pdf(pdf_bytes)

        print(f"\nResume text extracted: {len(resume_text)} chars")

        # 2. Research job/company requirements
        raw_results = self.search_job_requirements(company, role)

        print(f"Job requirement results: {len(raw_results)}")

        # 3. Process sources
        processed_sources = self.source_processor.process(
            raw_results,
            company
        )

        print(f"Processed sources: {len(processed_sources)}")

        # 4. Semantic retrieval of relevant sources
        query = (
            f"{company} {role} job requirements skills "
            f"qualifications responsibilities technical stack"
        )

        results = self.retriever.retrieve_live(
            query=query,
            sources=processed_sources,
            top_k=8
        )

        print(f"Retrieved sources: {len(results)}")

        # 5. Fallback: also search for interview/ATS patterns
        interview_query = (
            f"ATS applicant tracking system resume screening "
            f"{company} software engineer keywords"
        )

        interview_results = self.retriever.retrieve_live(
            query=interview_query,
            sources=processed_sources,
            top_k=5
        )

        # Combine all evidence
        all_evidence = results + interview_results

        # Build context
        context = build_context(all_evidence)

        # 6. Generate ATS analysis
        prompt = ATS_RESUME_ANALYSIS_PROMPT.format(
            company=company,
            role=role,
            resume_text=resume_text,
            context=context
        )

        response = generate_answer(
            "You are an expert ATS resume analyzer and career coach. "
            "You analyze resumes against specific company and role requirements "
            "and provide honest, actionable feedback.",
            prompt
        )

        analysis = self._parse_json_response(response)

        return {
            "company": company,
            "role": role,
            "resume_text": resume_text,
            "analysis": analysis,
            "sources_found": len(all_evidence)
        }

    def _parse_json_response(self, response: str):
        response = response.strip()

        if response.startswith("```"):
            response = response.replace("```json", "")
            response = response.replace("```", "")
            response = response.strip()

        try:
            return json.loads(response)
        except json.JSONDecodeError:
            start = response.find("{")
            end = response.rfind("}")

            if start != -1 and end != -1:
                json_text = response[start:end + 1]
                try:
                    return json.loads(json_text)
                except json.JSONDecodeError:
                    pass

            return {
                "error": "Unable to parse ATS analysis response",
                "raw_response": response,
                "ats_score": 0,
                "matched_keywords": [],
                "missing_keywords": [],
                "weak_keywords": [],
                "strengths": ["Analysis could not be completed. Please try again."],
                "weaknesses": [],
                "line_by_line_suggestions": [],
                "company_specific_recommendations": [],
                "final_verdict": "Analysis failed due to response parsing error.",
                "disclaimer": "This is an AI-estimated ATS compatibility analysis."
            }
