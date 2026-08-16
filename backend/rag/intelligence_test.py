import sys
from pathlib import Path
import json

sys.path.append(str(Path(__file__).resolve().parent.parent))

from rag.rag_pipeline import RAGPipeline

pipeline = RAGPipeline()


result = pipeline.analyze_interview_process(
    company="Sprinklr",
    role="SDE / Software Engineering",
    top_k=10
)


print("\n========================================")
print("INTERVIEW INTELLIGENCE")
print("========================================\n")


print(
    json.dumps(
        result["analysis"],
        indent=2,
        ensure_ascii=False
    )
)


print("\n========================================")
print("SOURCES USED")
print("========================================\n")

for i, source in enumerate(
    result["sources"],
    start=1
):

    print(f"\nSOURCE {i}")
    print("Name:", source["source_name"])
    print("Type:", source["source_type"])
    print("Role:", source["role"])
    print("Date:", source["published_date"])
    print("URL:", source["source_url"])