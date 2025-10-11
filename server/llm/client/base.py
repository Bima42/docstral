import json
import httpx
import logging

from abc import ABC, abstractmethod
from typing import AsyncGenerator, Optional
from pydantic import BaseModel

from schemas.llm import ChatCompletionMessage

logger = logging.getLogger(__name__)


class LLMConfig(BaseModel):
    """Base config for LLM client."""

    model: str
    temperature: float = 0.1
    timeout: float = 60.0
    read_timeout: float = 90.0
    connect_timeout: float = 10.0


class BaseLLMClient(ABC):
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


class LLMClient(BaseLLMClient):
    """
    Base class for any OpenAI-compatible streaming API (Mistral, vLLM, Groq, etc.).
    Handles HTTP client lifecycle, SSE parsing, and tool-call delta accumulation.
    Subclasses implement URL/headers/payload hooks.
    """

    def __init__(
        self, config: LLMConfig, http_client: Optional[httpx.AsyncClient] = None
    ):
        self.config = config
        timeout = httpx.Timeout(
            config.timeout,
            read=config.read_timeout,
            connect=config.connect_timeout,
        )
        self._http_client = http_client or httpx.AsyncClient(timeout=timeout)
        self._owns_client = http_client is None

    @abstractmethod
    def _build_url(self) -> str:
        """Return the full URL for chat completions."""
        ...

    @abstractmethod
    def _build_headers(self) -> dict[str, str]:
        """Return HTTP headers (auth + content-type)."""
        ...

    def _build_payload(
        self, messages: list[dict], tools: Optional[list[dict]] = None
    ) -> dict:
        """Build the JSON payload. Override if you need custom fields."""
        payload = {
            "model": self.config.model,
            "messages": messages,
            "temperature": self.config.temperature,
            "stream": True,
        }
        if tools:
            payload["tools"] = tools
            payload["tool_choice"] = "any"
        return payload

    async def stream_chat(
        self,
        messages: list[dict],
        tools: Optional[list[dict]] = None,
    ) -> AsyncGenerator[str | dict, None]:
        """
        Stream SSE from OpenAI-compatible API.
        Yields content strings OR {"tool_calls": [...]} dict on finish.
        """
        url = self._build_url()
        headers = self._build_headers()
        payload = self._build_payload(messages, tools)

        accumulated_tool_calls = {}

        async with self._http_client.stream(
            "POST", url, headers=headers, json=payload
        ) as resp:
            resp.raise_for_status()
            async for line in resp.aiter_lines():
                if not line or not line.startswith("data:"):
                    continue
                data = line[5:].strip()
                if data == "[DONE]":
                    break
                try:
                    event = json.loads(data)
                except json.JSONDecodeError:
                    continue

                choice = event.get("choices", [{}])[0]
                delta = choice.get("delta", {})
                finish_reason = choice.get("finish_reason")

                # Accumulate tool call deltas
                if "tool_calls" in delta:
                    for tc_delta in delta["tool_calls"]:
                        idx = tc_delta.get("index", 0)
                        if idx not in accumulated_tool_calls:
                            accumulated_tool_calls[idx] = {
                                "id": tc_delta.get("id", ""),
                                "type": tc_delta.get("type", "function"),
                                "function": {
                                    "name": "",
                                    "arguments": "",
                                },
                            }

                        if "id" in tc_delta:
                            accumulated_tool_calls[idx]["id"] = tc_delta["id"]

                        if "function" in tc_delta:
                            func_delta = tc_delta["function"]
                            if "name" in func_delta:
                                accumulated_tool_calls[idx]["function"][
                                    "name"
                                ] += func_delta["name"]
                            if "arguments" in func_delta:
                                accumulated_tool_calls[idx]["function"][
                                    "arguments"
                                ] += func_delta["arguments"]

                # Yield content if present
                message = ChatCompletionMessage(**delta)
                if message.content:
                    yield message.content

                # Yield tool calls when stream finishes
                if finish_reason == "tool_calls" and accumulated_tool_calls:
                    tool_calls_list = list(accumulated_tool_calls.values())
                    logger.info(
                        f"Tool calls requested: {[tc['function']['name'] for tc in tool_calls_list]}"
                    )
                    yield {"tool_calls": tool_calls_list}

    async def close(self) -> None:
        """Close the HTTP client if we own it."""
        if self._owns_client:
            await self._http_client.aclose()
