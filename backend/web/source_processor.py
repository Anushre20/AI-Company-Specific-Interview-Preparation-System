from urllib.parse import urlparse


class SourceProcessor:

    def __init__(self):
        self.official_domains = {}

        self.reported_domains = {
            "geeksforgeeks.org",
            "leetcode.com",
            "interviewbit.com",
            "glassdoor.co.in",
            "glassdoor.com",
            "ambitionbox.com"
        }

        self.low_quality_domains = {
            "pinterest.com",
            "facebook.com",
            "instagram.com",
            "x.com",
            "twitter.com",
            "youtube.com",
            "quora.com"
        }

    def get_domain(self, url):

        try:
            domain = urlparse(url).netloc.lower()

            if domain.startswith("www."):
                domain = domain[4:]

            return domain

        except Exception:
            return ""

    def detect_official_domain(self, results, company):

        company_key = company.lower().strip()

        # Return cached domain if already detected
        if company_key in self.official_domains:
            return self.official_domains[company_key]

        company_words = [
            word.lower()
            for word in company_key.replace("-", " ").split()
            if word
        ]

        candidate_domains = []

        for result in results:

            url = result.get("url", "")

            if not url:
                continue

            domain = self.get_domain(url)

            if not domain:
                continue

            # Ignore known third-party/reporting platforms
            if domain in self.reported_domains:
                continue

            # Prefer domains containing the company name
            if any(word in domain for word in company_words):
                candidate_domains.append(domain)

        if not candidate_domains:
            return None

        # Count occurrences of each candidate domain
        domain_counts = {}

        for domain in candidate_domains:
            domain_counts[domain] = (
                domain_counts.get(domain, 0) + 1
            )

        official_domain = max(
            domain_counts,
            key=domain_counts.get
        )

        self.official_domains[company_key] = [
            official_domain
        ]

        return official_domain

    def classify_source(self, result, company):

        url = result.get("url", "")
        domain = self.get_domain(url)

        company_key = company.lower().strip()

        official_domains = self.official_domains.get(
            company_key,
            []
        )

        for official_domain in official_domains:

            if (
                domain == official_domain
                or domain.endswith("." + official_domain)
            ):
                return "official"

        if domain in self.reported_domains:

            return "reported"

        title = (result.get("title") or "").lower()
        content = (result.get("content") or "").lower()

        job_keywords = [
            "job description",
            "job opening",
            "software engineer",
            "software development engineer",
            "career opportunity",
            "job posting"
        ]

        if any(keyword in title for keyword in job_keywords):

            return "job_description"

        if any(keyword in content for keyword in job_keywords):

            return "job_description"

        return "other"

    def is_quality_source(self, result):

        url = result.get("url", "")
        domain = self.get_domain(url)

        if not domain:
            return False

        if domain in self.low_quality_domains:
            return False

        title = (result.get("title") or "").lower()
        content = (result.get("content") or "").lower()

        if not title and not content:
            return False

        return True

    def deduplicate(self, results):

        unique_results = []
        seen_urls = set()

        for result in results:

            url = result.get("url")

            if not url:
                continue

            normalized_url = url.rstrip("/").lower()

            if normalized_url in seen_urls:
                continue

            seen_urls.add(normalized_url)
            unique_results.append(result)

        return unique_results

    def process(self, results, company):

        unique_results = self.deduplicate(results)

        quality_results = [
            result
            for result in unique_results
            if self.is_quality_source(result)
        ]

        official_domain = self.detect_official_domain(
            quality_results,
            company
        )

        processed_results = []

        for result in quality_results:

            source_type = self.classify_source(
                result,
                company
            )

            processed_results.append({
                "company": company,
                "source_type": source_type,
                "source_name": result.get("title"),
                "source_url": result.get("url"),
                "content": result.get("content"),
                "raw_content": result.get("raw_content"),
                "search_score": result.get("score"),
                "query": result.get("query"),
                "domain": self.get_domain(
                    result.get("url", "")
                )
            })

        return processed_results


if __name__ == "__main__":

    from search import WebSearch

    searcher = WebSearch()
    processor = SourceProcessor()

    company = "Databricks"

    results = searcher.search_company(
        company,
        max_results=5
    )

    processed = processor.process(
        results,
        company
    )

    print("\n==============================")
    print("SOURCE PROCESSING RESULTS")
    print("==============================")

    print("\nRaw results:", len(results))
    print("Processed results:", len(processed))

    for i, result in enumerate(processed, start=1):

        print(f"\n--- SOURCE {i} ---")

        print("Type:", result["source_type"])
        print("Name:", result["source_name"])
        print("URL:", result["source_url"])
        print("Search Score:", result["search_score"])
        print("Domain:", result["domain"])

        print("Content:")
        print((result["content"] or "")[:300])