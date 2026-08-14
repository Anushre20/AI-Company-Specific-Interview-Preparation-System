def build_context(results):
    if not results:
        return "No relevant evidence was found."

    context_parts = []

    for i, result in enumerate(results, start=1):

        source_type = result.get("source_type", "unknown")
        source_name = result.get("source_name", "Unknown source")
        published_date = result.get("published_date")
        company = result.get("company", "Unknown")
        role = result.get("role", "Unknown")
        source_url = result.get("source_url")
        content = result.get("content", "")

        if published_date is None:
            published_date = "Unknown"

        context_parts.append(
            f"""
SOURCE {i}
Company: {company}
Role: {role}
Source Type: {source_type}
Source Name: {source_name}
Published Date: {published_date}
Source URL: {source_url}

CONTENT:
{content}
"""
        )

    return "\n".join(context_parts)


if __name__ == "__main__":

    sample_results = [
        {
            "company": "Sprinklr",
            "role": "SDE / Software Engineering",
            "source_type": "reported",
            "source_name": "Sprinklr Interview Experience - On Campus",
            "source_url": "https://example.com",
            "published_date": "2025-07-23",
            "content": "Candidates reported coding and technical interview questions.",
            "distance": 0.42
        }
    ]

    context = build_context(sample_results)

    print(context)