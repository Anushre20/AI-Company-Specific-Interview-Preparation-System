import sys
from pathlib import Path
import json
sys.path.append(str(Path(__file__).resolve().parent.parent))
import faiss
from sentence_transformers import SentenceTransformer

from rag.context_builder import build_context


VECTOR_STORE_PATH = Path("data/vector_store")
INDEX_PATH = VECTOR_STORE_PATH / "interview_index.faiss"
METADATA_PATH = VECTOR_STORE_PATH / "metadata.json"


class InterviewRetriever:

    def __init__(self):
        print("Loading embedding model...")

        self.model = SentenceTransformer("all-MiniLM-L6-v2")

        print("Loading FAISS index...")

        self.index = faiss.read_index(str(INDEX_PATH))

        print("Loading metadata...")

        with open(METADATA_PATH, "r", encoding="utf-8") as file:
            self.metadata = json.load(file)

    def retrieve(
        self,
        query,
        top_k=3,
        company=None,
        role=None,
        source_type=None,
        round_name=None
    ):

        query_embedding = self.model.encode(
            [query],
            convert_to_numpy=True
        )

    # Retrieve extra candidates because some
    # will be removed by metadata filters.
        candidate_k = min(
            max(top_k * 5, 10),
            self.index.ntotal
        )

        distances, indices = self.index.search(
            query_embedding,
            candidate_k
        )

        results = []

        for distance, index in zip(distances[0], indices[0]):

            if index == -1:
                continue

            result = self.metadata[index]

            if company and result["company"].lower() != company.lower():
                continue

            if role and result["role"].lower() != role.lower():
                continue

            if source_type and result["source_type"].lower() != source_type.lower():
                continue

            if round_name and result.get("round", "").lower() != round_name.lower():
                continue

            result = result.copy()
            result["distance"] = float(distance)

            results.append(result)

            if len(results) == top_k:
                break

        return results

    def retrieve_live(
        self,
        query,
        sources,
        top_k=5
    ):

        if not sources:
            return []

        documents = []

        for source in sources:

            content = source.get("content") or source.get("raw_content") or ""

            if not content.strip():
                continue

            documents.append({
                **source,
                "content": content
            })

        if not documents:
            return []

        texts = [
            document["content"]
            for document in documents
        ]

        embeddings = self.model.encode(
            texts,
            convert_to_numpy=True
        )

        query_embedding = self.model.encode(
            [query],
            convert_to_numpy=True
        )

        similarities = embeddings @ query_embedding[0]

        ranked_indices = similarities.argsort()[::-1]

        results = []

        for index in ranked_indices[:top_k]:

            result = documents[index].copy()

            result["distance"] = float(
                1 - similarities[index]
            )

            results.append(result)

        return results

if __name__ == "__main__":

    retriever = InterviewRetriever()

    query = "What technical questions are asked in Sprinklr interviews?"

    results = retriever.retrieve(
        query,
        top_k=3,
        company="Sprinklr",
        source_type="reported"
    )

    from web.search import WebSearch
    from web.source_processor import SourceProcessor

    searcher = WebSearch()
    processor = SourceProcessor()

    live_results = searcher.search_company(
        "Sprinklr",
        max_results=5
    )

    processed_results = processor.process(
        live_results,
        "Sprinklr"
    )

    live_retrieved = retriever.retrieve_live(
        query,
        processed_results,
        top_k=3
    )

    print("\n==============================")
    print("LIVE RAG RESULTS")
    print("==============================")

    for i, result in enumerate(live_retrieved, start=1):

        print(f"\n--- Live Result {i} ---")
        print("Source:", result["source_name"])
        print("Type:", result["source_type"])
        print("URL:", result["source_url"])
        print("Distance:", result["distance"])
        print("Content:")
        print(result["content"][:500])
        
    context = build_context(results)

    print("\n==============================")
    print("RAG CONTEXT")
    print("==============================")
    print(context)

    print("\nQuery:")
    print(query)

    print("\nRetrieved Results:")

    for i, result in enumerate(results, start=1):

        print("Company:", result["company"])
        print("Role:", result["role"])
        print("Source:", result["source_name"])
        print("Source Type:", result["source_type"])
        print("Published Date:", result["published_date"])
        print("Distance:", result["distance"])
        print("Content:")
        print(result["content"])