from sentence_transformers import SentenceTransformer
import numpy as np
import faiss
import json
import logging
from typing import List

logger = logging.getLogger(__name__)


class DocumentEmbedder:
    def __init__(self, model_name="sentence-transformers/all-MiniLM-L6-v2"):
        self.model = SentenceTransformer(model_name)
        self.index = None
        self.chunks = []
        self.metadata = []

    def chunk_text(
        self, text: str, chunk_size: int = 500, overlap: int = 50
    ) -> List[str]:
        """Split text into chunks with overlap"""
        words = text.split()
        chunks = []

        for i in range(0, len(words), chunk_size - overlap):
            chunk = " ".join(words[i : i + chunk_size])
            if chunk:
                chunks.append(chunk)

        return chunks

    def create_embeddings(self, docs_file="./data/mistral_docs.json"):
        """Create embeddings and FAISS index"""
        logger.info(f"Loading documents from {docs_file}")
        with open(docs_file, "r", encoding="utf-8") as f:
            docs = json.load(f)

        logger.info(f"Processing {len(docs)} documents")
        all_embeddings = []

        for i, doc in enumerate(docs, 1):
            chunks = self.chunk_text(doc["content"])
            logger.debug(
                f"Document {i}/{len(docs)}: {doc['title']} - {len(chunks)} chunks"
            )

            for chunk in chunks:
                self.chunks.append(chunk)
                self.metadata.append({"url": doc["url"], "title": doc["title"]})

            embeddings = self.model.encode(chunks)
            all_embeddings.extend(embeddings)

        logger.info("Creating FAISS index")
        embeddings_array = np.array(all_embeddings).astype("float32")
        dimension = embeddings_array.shape[1]

        self.index = faiss.IndexFlatL2(dimension)
        self.index.add(embeddings_array)

        logger.info(f"Index created with {len(self.chunks)} chunks")

    def save_index(
        self,
        index_path="./data/faiss_index.bin",
        chunks_path="./data/chunks.json",
        metadata_path="./data/metadata.json",
    ):
        """Save index and metadata"""
        logger.info(f"Saving FAISS index to {index_path}")
        faiss.write_index(self.index, index_path)

        logger.info(f"Saving chunks to {chunks_path}")
        with open(chunks_path, "w", encoding="utf-8") as f:
            json.dump(self.chunks, f, ensure_ascii=False)

        logger.info(f"Saving metadata to {metadata_path}")
        with open(metadata_path, "w", encoding="utf-8") as f:
            json.dump(self.metadata, f, ensure_ascii=False)

        logger.info("All files saved successfully")


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )
    embedder = DocumentEmbedder()
    embedder.create_embeddings()
    embedder.save_index()
