from pathlib import Path

from sentence_transformers import SentenceTransformer
import numpy as np
import faiss
import json
import logging
from typing import List, Dict
from langchain_text_splitters import (
    MarkdownHeaderTextSplitter,
    RecursiveCharacterTextSplitter,
)

from core import settings

logger = logging.getLogger(__name__)


class DocumentEmbedder:
    def __init__(
        self,
        model_name: str = "BAAI/bge-small-en-v1.5",
        chunk_size: int = 2000,
        small_chunk_size: int = 200,
        data_dir: Path | None = None,
    ):
        logger.info(f"Loading embedding model: {model_name}")
        self.model = SentenceTransformer(model_name)
        self.index = None
        self.chunks = []
        self.metadata = []
        self.small_chunk_size = small_chunk_size
        self.chunk_size = chunk_size
        self.data_dir = Path(data_dir or settings.DATA_DIR)
        self.data_dir.mkdir(parents=True, exist_ok=True)

        self.md_splitter = MarkdownHeaderTextSplitter(
            headers_to_split_on=[
                ("#", "h1"),
                ("##", "h2"),
            ],
            strip_headers=False,
        )

        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=200,
            separators=["\n\n", "\n", " ", ""],
            length_function=len,
            is_separator_regex=False,
        )

    @property
    def docs_path(self) -> Path:
        return self.data_dir / "mistral_docs.json"

    @property
    def index_path(self) -> Path:
        return self.data_dir / "faiss_index.bin"

    @property
    def chunks_path(self) -> Path:
        return self.data_dir / "chunks.json"

    @property
    def metadata_path(self) -> Path:
        return self.data_dir / "metadata.json"

    def _log_statistics(self):
        logger.info(f"Index created with {len(self.chunks)} chunks")

        chunk_words = [len(c.split()) for c in self.chunks]
        chunk_chars = [len(c) for c in self.chunks]

        logger.info(
            f"Chunk size (words) - avg: {np.mean(chunk_words):.0f}, "
            f"median: {np.median(chunk_words):.0f}, "
            f"min: {np.min(chunk_words):.0f}, "
            f"max: {np.max(chunk_words):.0f}"
        )
        logger.info(
            f"Chunk size (chars) - avg: {np.mean(chunk_chars):.0f}, "
            f"median: {np.median(chunk_chars):.0f}"
        )

        content_types = {}
        for meta in self.metadata:
            ct = meta.get("content_type", "unknown")
            content_types[ct] = content_types.get(ct, 0) + 1
        logger.info(f"Chunks by content type: {content_types}")

        code_chunks = sum(1 for meta in self.metadata if meta.get("has_code", False))
        logger.info(f"Chunks with code: {code_chunks}/{len(self.chunks)}")

    def chunk_document(
        self, content: str, doc_metadata: Dict, doc_title: str
    ) -> List[Dict]:
        """
        Chunk document by H1/H2 structure, then by size if needed.
        Only store url + title for attribution.
        """
        chunks = []

        try:
            md_chunks = self.md_splitter.split_text(content)
        except Exception as e:
            logger.warning(f"Markdown splitting failed for {doc_title}: {e}")
            md_chunks = [{"page_content": content, "metadata": {}}]

        for md_chunk in md_chunks:
            text = (
                md_chunk.page_content
                if hasattr(md_chunk, "page_content")
                else md_chunk.get("page_content", "")
            )
            text = text.strip()

            if len(text) < self.small_chunk_size:
                continue

            # If section too large, split further
            if len(text) > self.chunk_size:
                sub_chunks = self.text_splitter.split_text(text)
                for sub_text in sub_chunks:
                    sub_text = sub_text.strip()
                    if len(sub_text) < self.small_chunk_size:
                        continue

                    chunks.append(
                        {
                            "text": sub_text,
                            "metadata": {
                                **doc_metadata,
                                "chunk_chars": len(sub_text),
                                "chunk_words": len(sub_text.split()),
                            },
                        }
                    )
            else:
                chunks.append(
                    {
                        "text": text,
                        "metadata": {
                            **doc_metadata,
                            "chunk_chars": len(text),
                            "chunk_words": len(text.split()),
                        },
                    }
                )

        return chunks

    def create_embeddings(self):
        """Create embeddings from documents"""
        logger.info(f"Loading documents from {self.docs_path}")

        if not self.docs_path.exists():
            raise FileNotFoundError(
                f"Documents file not found: {self.docs_path}. "
                "Run scraper.py first to generate docs."
            )

        with open(self.docs_path, "r", encoding="utf-8") as f:
            docs = json.load(f)

        logger.info(f"Processing {len(docs)} documents")
        all_embeddings = []

        for i, doc in enumerate(docs, 1):
            doc_chunks = self.chunk_document(
                content=doc["content"],
                doc_metadata=doc["metadata"],
                doc_title=doc["title"],
            )

            logger.debug(
                f"Document {i}/{len(docs)}: {doc['title']} - {len(doc_chunks)} chunks"
            )

            for chunk_data in doc_chunks:
                self.chunks.append(chunk_data["text"])
                self.metadata.append(
                    {
                        "url": doc["url"],
                        "title": doc["title"],
                        **chunk_data["metadata"],
                    }
                )

            chunk_texts = [c["text"] for c in doc_chunks]
            if chunk_texts:
                embeddings = self.model.encode(
                    chunk_texts,
                    show_progress_bar=False,
                    normalize_embeddings=True,
                )
                all_embeddings.extend(embeddings)

        logger.info("Creating FAISS index")
        embeddings_array = np.array(all_embeddings).astype("float32")
        dimension = embeddings_array.shape[1]

        self.index = faiss.IndexFlatIP(dimension)
        self.index.add(embeddings_array)
        self._log_statistics()

    def save_index(self):
        """Save index and metadata"""
        if self.index is None:
            raise ValueError("No index to save. Run create_embeddings() first.")

        logger.info(f"Saving FAISS index to {self.index_path}")
        faiss.write_index(self.index, str(self.index_path))

        logger.info(f"Saving {len(self.chunks)} chunks to {self.chunks_path}")
        with open(self.chunks_path, "w", encoding="utf-8") as f:
            json.dump(self.chunks, f, ensure_ascii=False, indent=2)

        logger.info(
            f"Saving {len(self.metadata)} metadata entries to {self.metadata_path}"
        )
        with open(self.metadata_path, "w", encoding="utf-8") as f:
            json.dump(self.metadata, f, ensure_ascii=False, indent=2)

        logger.info("All files saved successfully")


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )
    embedder = DocumentEmbedder()
    embedder.create_embeddings()
    embedder.save_index()
