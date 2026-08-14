import sys
from pathlib import Path
import json

sys.path.append(str(Path(__file__).resolve().parent.parent))

import faiss
from sentence_transformers import SentenceTransformer

from data.sources import sources
from rag.source_loader import load_source


VECTOR_STORE_PATH = Path("data/vector_store")
INDEX_PATH = VECTOR_STORE_PATH / "interview_index.faiss"
METADATA_PATH = VECTOR_STORE_PATH / "metadata.json"

CHUNK_SIZE = 500
CHUNK_OVERLAP = 100


def split_into_chunks(text):
    chunks = []

    start = 0

    while start < len(text):
        end = start + CHUNK_SIZE

        chunk = text[start:end].strip()

        if chunk:
            chunks.append(chunk)

        start += CHUNK_SIZE - CHUNK_OVERLAP

    return chunks


def create_metadata(chunks, source):
    metadata = []

    for i, chunk in enumerate(chunks):
        metadata.append({
            "chunk_id": i,
            "company": source["company"],
            "role": source["role"],
            "source_type": source["source_type"],
            "source_name": source["source_name"],
            "source_url": source["source_url"],
            "published_date": source["published_date"],
            "content": chunk
        })

    return metadata


def main():

    print("Starting InterviewIQ ingestion pipeline...\n")

    all_chunks = []
    all_metadata = []

    for source in sources:

        print(f"Loading: {source['source_name']}")

        try:
            text = load_source(source["source_url"])

            print(f"Characters loaded: {len(text)}")

            chunks = split_into_chunks(text)

            print(f"Chunks created: {len(chunks)}")

            metadata = create_metadata(
                chunks,
                source
            )

            all_chunks.extend(chunks)
            all_metadata.extend(metadata)

            print("Source processed successfully.\n")

        except Exception as error:

            print(
                f"Failed to process "
                f"{source['source_name']}: {error}\n"
            )

    if not all_chunks:

        print("No documents were successfully loaded.")
        return

    print("Creating embeddings...")

    model = SentenceTransformer(
        "all-MiniLM-L6-v2"
    )

    embeddings = model.encode(
        all_chunks,
        convert_to_numpy=True,
        show_progress_bar=True
    )

    dimension = embeddings.shape[1]

    index = faiss.IndexFlatL2(dimension)

    index.add(embeddings)

    VECTOR_STORE_PATH.mkdir(
        parents=True,
        exist_ok=True
    )

    faiss.write_index(
        index,
        str(INDEX_PATH)
    )

    with open(
        METADATA_PATH,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            all_metadata,
            file,
            indent=2,
            ensure_ascii=False
        )

    print("\n===================================")
    print("Ingestion complete!")
    print("===================================")
    print("Sources processed:", len(sources))
    print("Total chunks:", len(all_chunks))
    print("Embedding dimension:", dimension)
    print("FAISS vectors:", index.ntotal)
    print("FAISS index:", INDEX_PATH)
    print("Metadata:", METADATA_PATH)


if __name__ == "__main__":
    main()