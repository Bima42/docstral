import faiss
import json
from sentence_transformers import SentenceTransformer

from llm import LLMClient


class RAGService:
    def __init__(self, llm_client: LLMClient):
        self.index = faiss.read_index("./server/scraper/data/faiss_index.bin")

        with open("./server/scraper/data/chunks.json", "r", encoding="utf-8") as f:
            self.chunks = json.load(f)

        with open("./server/scraper/data/metadata.json", "r", encoding="utf-8") as f:
            self.metadata = json.load(f)

        self.embedder = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
        self.llm_client = llm_client

    def search(self, query: str, top_k: int = 5):
        query_embedding = self.embedder.encode([query]).astype("float32")
        distances, indices = self.index.search(query_embedding, top_k)
        results = []
        for idx, dist in zip(indices[0], distances[0]):
            results.append(
                {
                    "chunk": self.chunks[idx],
                    "metadata": self.metadata[idx],
                    "distance": float(dist),
                }
            )

        return results

    async def generate_answer(self, query: str, context: str) -> str:
        prompt = f"""Base on following context, answer the question.

Context:
{context}

Question: {query}

Answer:"""

        messages = [{"role": "user", "content": prompt}]
        answer = await self.llm_client.complete(messages)
        return answer
