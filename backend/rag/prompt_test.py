import sys
from pathlib import Path
import json
sys.path.append(str(Path(__file__).resolve().parent.parent))
from rag.retriever import InterviewRetriever
from rag.context_builder import build_context
from rag.prompts import SYSTEM_PROMPT, build_rag_prompt


retriever = InterviewRetriever()

question = "What technical questions should I prepare for a Sprinklr SDE interview?"

results = retriever.retrieve(
    question,
    top_k=3,
    company="Sprinklr",
    role="SDE / Software Engineering",
    source_type="reported"
)

context = build_context(results)

prompt = build_rag_prompt(
    question,
    context
)

print("\n================ SYSTEM PROMPT ================\n")
print(SYSTEM_PROMPT)

print("\n================ RAG PROMPT ================\n")
print(prompt)