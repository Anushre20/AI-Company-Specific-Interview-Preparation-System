import sys
from pathlib import Path
import json

sys.path.append(str(Path(__file__).resolve().parent.parent))
from rag.retriever import InterviewRetriever
from rag.context_builder import build_context
from rag.prompts import (
    SYSTEM_PROMPT,
    build_rag_prompt,
    build_interview_intelligence_prompt
)
from rag.llm import generate_answer


class RAGPipeline:

    def __init__(self):
        self.retriever = InterviewRetriever()

    def ask(
        self,
        question,
        company=None,
        role=None,
        source_type=None,
        top_k=3
    ):

        results = self.retriever.retrieve(
            query=question,
            top_k=top_k,
            company=company,
            role=role,
            source_type=source_type
        )

        context = build_context(results)

        prompt = build_rag_prompt(
            question,
            context
        )

        answer = generate_answer(
            SYSTEM_PROMPT,
            prompt
        )

        return {
            "question": question,
            "answer": answer,
            "sources": results
        }

    def _parse_json_response(self, response):

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
                "error": "Unable to parse interview intelligence response",
                "raw_response": response
            }

    def analyze_interview_process(
        self,
        company,
        role=None,
        top_k=10
    ):

        query = (
            f"interview process rounds technical questions "
            f"online assessment HR managerial topics "
            f"for {company}"
        )

        results = self.retriever.retrieve(
            query=query,
            top_k=top_k,
            company=company,
            role=role
        )

        context = build_context(results)

        prompt = build_interview_intelligence_prompt(
            company=company,
            context=context
        )

        response = generate_answer(
            SYSTEM_PROMPT,
            prompt
        )

        analysis = self._parse_json_response(response)
        return {
            "company": company,
            "role": role,
            "analysis": response,
            "sources": results
        }