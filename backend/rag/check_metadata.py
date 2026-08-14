import json
from collections import Counter


with open(
    "data/vector_store/metadata.json",
    "r",
    encoding="utf-8"
) as file:
    metadata = json.load(file)


source_counts = Counter(
    item["source_name"]
    for item in metadata
)

type_counts = Counter(
    item["source_type"]
    for item in metadata
)


print("\nChunks by source:")

for source, count in source_counts.items():
    print(f"{source}: {count}")


print("\nChunks by source type:")

for source_type, count in type_counts.items():
    print(f"{source_type}: {count}")


print("\nTotal chunks:", len(metadata))