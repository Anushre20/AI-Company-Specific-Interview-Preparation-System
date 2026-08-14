import requests
from bs4 import BeautifulSoup


def fetch_url(url):
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
            "AppleWebKit/537.36 Chrome/151.0 Safari/537.36"
        )
    }

    response = requests.get(
        url,
        headers=headers,
        timeout=20
    )

    response.raise_for_status()

    return response.text


def html_to_text(html):
    soup = BeautifulSoup(html, "html.parser")

    for element in soup([
        "script",
        "style",
        "nav",
        "footer",
        "header"
    ]):
        element.decompose()

    text = soup.get_text(
        separator=" ",
        strip=True
    )

    return text


def load_source(url):
    html = fetch_url(url)

    text = html_to_text(html)

    return text


if __name__ == "__main__":

    url = input("Enter source URL: ").strip()

    text = load_source(url)

    print("\nSource loaded successfully!")
    print("Characters:", len(text))

    print("\nFirst 1000 characters:\n")
    print(text[:1000])