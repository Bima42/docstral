from abc import ABC, abstractmethod
from typing import AsyncGenerator, Optional
from pydantic import BaseModel


class LLMConfig(BaseModel):
    """Base config for LLM client."""

    model: str
    temperature: float = 0.1
    timeout: float = 60.0
    read_timeout: float = 90.0
    connect_timeout: float = 10.0


class LLMClient(ABC):
    """Abstract LLM client. All implementations must stream OpenAI-format chunks."""

    @abstractmethod
    async def stream_chat(
        self,
        messages: list[dict],
        tools: Optional[list[dict]] = None,
    ) -> AsyncGenerator[str, None]:
        """
        Yield content tokens from the assistant reply.
        `messages` must be OpenAI format: [{"role": "user", "content": "..."}]
        `tools` optional list of tool definitions (OpenAI function calling format)
        """
        ...

    @abstractmethod
    async def health_check(self) -> bool:
        """Return True if the service is reachable and healthy."""
        ...

    @abstractmethod
    async def close(self) -> None:
        """Clean up resources (e.g., HTTP client)."""
        ...
