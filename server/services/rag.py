import logging
from pathlib import Path
from typing import AsyncGenerator

import faiss
import json
from sentence_transformers import SentenceTransformer
from starlette.concurrency import run_in_threadpool

from llm import LLMClient

logger = logging.getLogger(__name__)


class RAGService:
    """
    Retrieves relevant chunks from FAISS, streams LLM answer with context.
    """

    def __init__(
        self,
        llm_client: LLMClient,
        data_dir: str = "/app/server/scraper/data",
    ):
        self.llm_client = llm_client
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

        # Load metadata
        metadata_path = self.data_dir / "metadata.json"
        if not metadata_path.exists():
            raise FileNotFoundError(f"Metadata file not found: {metadata_path}")
        with open(metadata_path, "r", encoding="utf-8") as f:
            self.metadata = json.load(f)

        self.embedder = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
        logger.info(f"RAGService initialized with {len(self.chunks)} chunks")

    async def search(self, query: str, top_k: int = 3) -> list[dict]:
        """
        Retrieve top_k most relevant chunks for the query.
        Returns: [{"chunk": str, "url": str, "title": str, "distance": float}, ...]
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
                    {
                        "chunk": self.chunks[idx],
                        "url": meta.get("url", ""),
                        "title": meta.get("title", "Unknown"),
                        "distance": float(dist),
                    }
                )
        return results

    def build_context_prompt(self, query: str, chunks: list[dict]) -> str:
        """
        Build a simple RAG prompt with context and sources.
        """
        context_parts = []
        for i, c in enumerate(chunks, start=1):
            context_parts.append(f"[{i}] {c['title']} ({c['url']})\n{c['chunk']}\n")
        context = "\n".join(context_parts)

        prompt = f"""You are a helpful assistant answering questions about Mistral AI documentation.

Context from documentation:
{context}

User question: {query}

Instructions:
- Answer based on the context if relevant
- Cite sources using [1], [2], etc. when referencing specific information
- If the context doesn't contain relevant information, say so and provide a general answer if possible
- Be concise and accurate

Answer:"""
        return prompt

    async def stream_answer_with_rag(self, query: str) -> AsyncGenerator[str, None]:
        """
        Retrieve context, build prompt, stream LLM answer.
        """
        try:
            chunks = await self.search(query, top_k=3)
            if not chunks:
                logger.warning("No relevant chunks found, answering without RAG")
                messages = [{"role": "user", "content": query}]
            else:
                prompt = self.build_context_prompt(query, chunks)
                messages = [{"role": "user", "content": prompt}]

            async for token in self.llm_client.stream_chat(messages):
                yield token

        except Exception as e:
            logger.error(f"RAG error: {e}", exc_info=True)
            # Fallback: answer without RAG
            messages = [{"role": "user", "content": query}]
            async for token in self.llm_client.stream_chat(messages):
                yield token
