import requests
from bs4 import BeautifulSoup
import xml.etree.ElementTree as ET
from typing import List, Dict
import time
import json


class MistralDocsScraper:
    def __init__(self, base_url="https://docs.mistral.ai"):
        self.base_url = base_url
        self.docs_content = []

    def _parse_sitemap(self, xml_content: bytes) -> List[str]:
        """Parse sitemap XML"""
        root = ET.fromstring(xml_content)

        ns = {"ns": "http://www.sitemaps.org/schemas/sitemap/0.9"}

        url_elements = root.findall(".//ns:url/ns:loc", ns)
        urls = [url.text for url in url_elements]
        print(f"Found {len(urls)} URLs in the sitemap")

        return urls

    def get_urls_from_sitemap(self, sitemap_url: str) -> List[str]:
        """Getting all possible urls from sitemap."""
        urls = []

        try:
            print(f"🔍 Trying to get sitemap : {sitemap_url}")
            response = requests.get(sitemap_url, timeout=10)

            if response.status_code == 200:
                print(f"✅ Sitemap trouvé : {sitemap_url}")
                urls = self._parse_sitemap(response.content)
        except Exception as e:
            print(f"Cannot parse sitemap: {e}")

        if not urls:
            raise Exception("No urls found in sitemap. Try another URL.")

        return urls

    def scrape_page(self, url: str) -> Dict | None:
        """Scrap HTML page content, excluding some useless part of the page."""
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, "html.parser")

            elements_to_remove = [
                "script",
                "style",
                "nav",
                "footer",
                "header",
                {"class": "menu-content"},
                {"class": "sidebar"},
                {"class": "navigation"},
                {"id": "sidebar"},
                {"role": "navigation"},
                {"class": "breadcrumb"},
                {"class": "page-nav"},
            ]

            for element in soup(elements_to_remove):
                element.decompose()

            for selector in [".menu-content", ".sidebar", '[role="navigation"]']:
                for element in soup.select(selector):
                    element.decompose()

            content = (
                soup.find("main")
                or soup.find("article")
                or soup.find("div", class_="content")
                or soup.find("div", {"role": "main"})
                or soup.find("div", class_="markdown")
                or soup.body
            )

            if content:
                title = ""
                h1 = soup.find("h1")
                if h1:
                    title = h1.get_text(strip=True)
                elif soup.title:
                    title = soup.title.get_text(strip=True)

                text = content.get_text(separator="\n", strip=True)

                lines = [line.strip() for line in text.split("\n") if line.strip()]
                text = "\n".join(lines)

                if len(text) < 50:
                    print(f"⚠️Ignoring small chunk from the following url: {url}")
                    return None

                return {
                    "url": url,
                    "title": title,
                    "content": text,
                    "length": len(text),
                }

            return None

        except Exception as e:
            print(f"❌ Fail to scrap {url}: {e}")
            return None

    def save_docs(self, filename="mistral_docs.json"):
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(self.docs_content, f, ensure_ascii=False, indent=2)

        total_chars = sum(doc["length"] for doc in self.docs_content)
        print(f"💾 Saved in {filename}")
        print(f"📊 Stats : {len(self.docs_content)} pages, ~{total_chars:,} chars")

    def scrape_all(self):
        print("🚀 Start scraping...")
        sitemap_url = f"{self.base_url}/sitemap.xml"

        urls = self.get_urls_from_sitemap(sitemap_url)

        for i, url in enumerate(urls, 1):
            print(f"⏳ [{i}/{len(urls)}] {url}")

            page_data = self.scrape_page(url)
            if page_data and page_data["content"]:
                self.docs_content.append(page_data)

            time.sleep(0.2)

        print(f"✅ Scraping over : {len(self.docs_content)} extracted pages.")
        self.save_docs()


if __name__ == "__main__":
    scraper = MistralDocsScraper()
    scraper.scrape_all()
