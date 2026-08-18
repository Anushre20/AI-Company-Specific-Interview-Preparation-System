import os

from dotenv import load_dotenv
from tavily import TavilyClient


load_dotenv()


class WebSearch:

    def __init__(self):
        api_key = os.getenv("TAVILY_API_KEY")

        if not api_key:
            raise ValueError(
                "TAVILY_API_KEY is not configured in backend/.env"
            )

        self.client = TavilyClient(api_key=api_key)

    def search_company(self, company, max_results=10):

        queries = [
            f"{company} interview experience software engineer",
            f"{company} interview questions GeeksforGeeks",
            f"{company} interview process careers",
            f"{company} hiring process software engineer",
            f"{company} engineering interview questions",
            f"{company} careers eligibility",
            f"{company} company values culture"
        ]

        all_results = []

        for query in queries:

            print(f"\nSearching: {query}")

            response = self.client.search(
                query=query,
                search_depth="advanced",
                max_results=max_results,
                include_raw_content=True
            )

            results = response.get("results", [])

            for result in results:

                all_results.append({
                    "query": query,
                    "title": result.get("title"),
                    "url": result.get("url"),
                    "content": result.get("content"),
                    "raw_content": result.get("raw_content"),
                    "score": result.get("score")
                })

        return all_results


if __name__ == "__main__":

    searcher = WebSearch()

    company = "Atlassian"

    results = searcher.search_company(
        company,
        max_results=5
    )

    print("\n\n==============================")
    print("TOTAL RESULTS:", len(results))
    print("==============================")

    for i, result in enumerate(results, start=1):

        print(f"\n--- RESULT {i} ---")
        print("Title:", result["title"])
        print("URL:", result["url"])
        print("Score:", result["score"])

        print("\nContent:")
        print(result["content"][:500])