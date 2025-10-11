import logging
from scraper import MistralDocsScraper
from embedder import DocumentEmbedder

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)


logger = logging.getLogger(__name__)


def setup_rag_system():
    logger.info("Scraping documentation ...")
    scraper = MistralDocsScraper()
    scraper.scrape_all()

    logger.info("Create embeddings and FAISS index")
    embedder = DocumentEmbedder()
    embedder.create_embeddings()
    embedder.save_index()


if __name__ == "__main__":
    setup_rag_system()
