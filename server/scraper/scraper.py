import requests
import logging
from bs4 import BeautifulSoup
import xml.etree.ElementTree as ET
from typing import List, Dict
import time
import json
from markdownify import markdownify as md

logger = logging.getLogger(__name__)


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
        logger.info(f"Found {len(urls)} URLs in the sitemap")

        return urls

    def get_urls_from_sitemap(self, sitemap_url: str) -> List[str]:
        """Getting all possible urls from sitemap."""
        urls = []

        try:
            logger.info(f"Attempting to fetch sitemap: {sitemap_url}")
            response = requests.get(sitemap_url, timeout=10)

            if response.status_code == 200:
                logger.info(f"Sitemap found: {sitemap_url}")
                urls = self._parse_sitemap(response.content)
        except Exception as e:
            logger.error(f"Cannot parse sitemap: {e}")

        if not urls:
            raise Exception("No urls found in sitemap. Try another URL.")

        return urls

    def _extract_section_path(self, soup: BeautifulSoup) -> str:
        """
        Extract hierarchical section path from headings
        Trying with breadcrumb first, fallback with regular HTML tag title
        """
        headings = []

        breadcrumb = soup.find("nav", class_="breadcrumb") or soup.find(
            "ol", class_="breadcrumb"
        )
        if breadcrumb:
            items = breadcrumb.find_all("a")
            headings = [
                item.get_text(strip=True) for item in items if item.get_text(strip=True)
            ]

        if not headings:
            h1 = soup.find("h1")
            if h1:
                headings.append(h1.get_text(strip=True))
            h2 = soup.find("h2")
            if h2 and h2.get_text(strip=True):
                headings.append(h2.get_text(strip=True))

        return " > ".join(headings) if headings else ""

    def _infer_content_type(self, url: str, title: str) -> str:
        """Infer content type from URL and title"""
        url_lower = url.lower()
        title_lower = title.lower()

        if "/api/" in url_lower or "api reference" in title_lower:
            return "api_ref"
        elif (
            "/guides/" in url_lower or "/guide/" in url_lower or "guide" in title_lower
        ):
            return "guide"
        elif "/examples/" in url_lower or "example" in title_lower:
            return "example"
        elif "/changelog" in url_lower or "changelog" in title_lower:
            return "changelog"
        else:
            return "general"

    def _has_code(self, content: str) -> bool:
        """Detect if content contains code blocks"""
        code_indicators = [
            "```",
            "import ",
            "def ",
            "const ",
            "function ",
            "curl ",
            "class ",
        ]
        return any(indicator in content for indicator in code_indicators)

    def _count_headings(self, content: str) -> int:
        """Count markdown headings in content"""
        lines = content.split("\n")
        return sum(1 for line in lines if line.strip().startswith("#"))

    def scrape_page(self, url: str) -> Dict | None:
        """Scrape HTML page and convert to structured Markdown."""
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

            if not content:
                logger.warning(f"No content found for {url}")
                return None

            title = ""
            h1 = soup.find("h1")
            if h1:
                title = h1.get_text(strip=True)
            elif soup.title:
                title = soup.title.get_text(strip=True)

            section_path = self._extract_section_path(soup)

            # Convert to Markdown
            markdown_content = md(
                str(content),
                heading_style="ATX",  # Use # style headings
                bullets="-",
                code_language="python",
                strip=["script", "style"],
            )

            lines = [line.rstrip() for line in markdown_content.split("\n")]

            cleaned_lines = []
            blank_count = 0
            for line in lines:
                if line.strip():
                    cleaned_lines.append(line)
                    blank_count = 0
                else:
                    blank_count += 1
                    if blank_count <= 2:
                        cleaned_lines.append(line)

            markdown_content = "\n".join(cleaned_lines).strip()

            if len(markdown_content) < 50:
                logger.warning(f"Ignoring small content from {url}")
                return None

            # Build metadata
            content_type = self._infer_content_type(url, title)
            has_code = self._has_code(markdown_content)
            heading_count = self._count_headings(markdown_content)

            return {
                "url": url,
                "title": title,
                "content": markdown_content,
                "metadata": {
                    "section_path": section_path,
                    "content_type": content_type,
                    "has_code": has_code,
                    "heading_count": heading_count,
                },
                "length": len(markdown_content),
            }

        except Exception as e:
            logger.error(f"Failed to scrape {url}: {e}")
            return None

    def save_docs(self, filename="./data/mistral_docs.json"):
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(self.docs_content, f, ensure_ascii=False, indent=2)

        total_chars = sum(doc["length"] for doc in self.docs_content)
        logger.info(f"Saved to {filename}")
        logger.info(
            f"Stats: {len(self.docs_content)} pages, ~{total_chars:,} characters"
        )

        # Log content type distribution
        content_types = {}
        for doc in self.docs_content:
            ct = doc["metadata"]["content_type"]
            content_types[ct] = content_types.get(ct, 0) + 1
        logger.info(f"Content types: {content_types}")

        # Log pages with code
        pages_with_code = sum(
            1 for doc in self.docs_content if doc["metadata"]["has_code"]
        )
        logger.info(f"Pages with code: {pages_with_code}/{len(self.docs_content)}")

    def scrape_all(self):
        logger.info("Starting scraping process...")
        sitemap_url = f"{self.base_url}/sitemap.xml"

        urls = self.get_urls_from_sitemap(sitemap_url)

        for i, url in enumerate(urls, 1):
            logger.info(f"Processing [{i}/{len(urls)}] {url}")

            page_data = self.scrape_page(url)
            if page_data and page_data["content"]:
                self.docs_content.append(page_data)

            time.sleep(0.2)

        logger.info(f"Scraping completed: {len(self.docs_content)} pages extracted")
        self.save_docs()


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )
    scraper = MistralDocsScraper()
    scraper.scrape_all()
