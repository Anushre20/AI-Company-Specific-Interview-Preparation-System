import sys
from pathlib import Path
import json

sys.path.append(str(Path(__file__).resolve().parent.parent))
from rag.retriever import InterviewRetriever
from rag.context_builder import build_context
from rag.prompts import SYSTEM_PROMPT, build_rag_prompt
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