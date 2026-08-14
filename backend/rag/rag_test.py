import sys
from pathlib import Path
import json

sys.path.append(str(Path(__file__).resolve().parent.parent))

from rag.rag_pipeline import RAGPipeline


pipeline = RAGPipeline()


question = (
    "What exact salary will every Sprinklr SDE intern receive "
    "in 2026?"
)


result = pipeline.ask(
    question=question,
    company="Sprinklr",
    role="SDE / Software Engineering",
    source_type="reported",
    top_k=3
)


print("\n======================================")
print("INTERVIEWIQ RAG ANSWER")
print("======================================\n")

print(result["answer"])


print("\n======================================")
print("SOURCES")
print("======================================\n")


for i, source in enumerate(
    result["sources"],
    start=1
):

    print(f"\nSOURCE {i}")
    print("Name:", source["source_name"])
    print("Type:", source["source_type"])
    print("Date:", source["published_date"])
    print("URL:", source["source_url"])