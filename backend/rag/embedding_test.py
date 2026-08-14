from sentence_transformers import SentenceTransformer
import faiss

model = SentenceTransformer("all-MiniLM-L6-v2")

texts = [
    "Google software engineering interviews focus on problem solving.",
    "Technical interviews may include data structures and algorithms.",
    "Behavioral interviews may evaluate communication and problem solving."
]

embeddings = model.encode(texts)

dimension = embeddings.shape[1]

index = faiss.IndexFlatL2(dimension)
index.add(embeddings)

print("Embeddings created successfully!")
print("Embedding size:", dimension)
print("Documents stored in FAISS:", index.ntotal)