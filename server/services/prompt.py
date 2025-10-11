from services.retrieval import RetrievedChunk


class PromptBuilder:
    """
    Stateless builder for prompts.
    """

    @staticmethod
    def build_rag_prompt(query: str, chunks: list[RetrievedChunk]) -> str:
        """
        Build a RAG prompt with context and citation instructions.
        """
        if not chunks:
            return query

        context_parts = []
        for i, c in enumerate(chunks, start=1):
            context_parts.append(f"[{i}] {c.title} ({c.url})\n{c.chunk}\n")
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
