import logging
from pathlib import Path
import json

import faiss
from sentence_transformers import SentenceTransformer
from starlette.concurrency import run_in_threadpool
from pydantic import BaseModel

logger = logging.getLogger(__name__)


class RetrievedChunk(BaseModel):
    chunk: str
    url: str
    title: str
    distance: float


class RetrievalService:
    """
    Handles FAISS-based semantic search over documentation chunks.
    Singleton pattern: expensive resources loaded once at startup.
    """

    def __init__(self, data_dir: str = "/app/server/scraper/data"):
        self.data_dir = Path(data_dir)

        index_path = self.data_dir / "faiss_index.bin"
        if not index_path.exists():
            raise FileNotFoundError(f"FAISS index not found: {index_path}")
        self.index = faiss.read_index(str(index_path))

        chunks_path = self.data_dir / "chunks.json"
        if not chunks_path.exists():
            raise FileNotFoundError(f"Chunks file not found: {chunks_path}")
        with open(chunks_path, "r", encoding="utf-8") as f:
            self.chunks = json.load(f)

        metadata_path = self.data_dir / "metadata.json"
        if not metadata_path.exists():
            raise FileNotFoundError(f"Metadata file not found: {metadata_path}")
        with open(metadata_path, "r", encoding="utf-8") as f:
            self.metadata = json.load(f)

        self.embedder = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
        logger.info(f"RetrievalService initialized with {len(self.chunks)} chunks")

    async def search(self, query: str, top_k: int = 3) -> list[RetrievedChunk]:
        """
        Retrieve top_k most relevant chunks for the query.
        Returns typed list of RetrievedChunk.
        """
        query_embedding = await run_in_threadpool(
            lambda: self.embedder.encode([query]).astype("float32")
        )
        distances, indices = self.index.search(query_embedding, top_k)

        results = []
        for idx, dist in zip(indices[0], distances[0]):
            if idx < len(self.chunks):
                meta = self.metadata[idx]
                results.append(
                    RetrievedChunk(
                        chunk=self.chunks[idx],
                        url=meta.get("url", ""),
                        title=meta.get("title", "Unknown"),
                        distance=float(dist),
                    )
                )
        return results


_retrieval_service_instance: RetrievalService | None = None


def set_retrieval_service(service: RetrievalService | None):
    global _retrieval_service_instance
    _retrieval_service_instance = service


def get_retrieval_service() -> RetrievalService | None:
    return _retrieval_service_instance
