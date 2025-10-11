import json
import os
import httpx
import logging

from typing import AsyncGenerator, Optional

from llm import LLMClient, LLMConfig
from schemas.llm import ChatCompletionMessage

logger = logging.getLogger(__name__)


class MistralConfig(LLMConfig):
    api_key: str
    api_url: str = "https://api.mistral.ai/v1/chat/completions"
    model: str = "ministral-3b-2410"

    @staticmethod
    def from_env() -> "MistralConfig":
        api_key = os.getenv("DOCSTRAL_MISTRAL_API_KEY", "").strip()
        model = os.getenv("DOCSTRAL_MISTRAL_MODEL", "ministral-3b-2410").strip()
        api_url = os.getenv(
            "DOCSTRAL_MISTRAL_API_URL", "https://api.mistral.ai/v1/chat/completions"
        ).strip()

        return MistralConfig(
            api_key=api_key,
            model=model,
            api_url=api_url,
        )


class MistralLLMClient(LLMClient):
    def __init__(
        self, config: MistralConfig, http_client: Optional[httpx.AsyncClient] = None
    ):
        self.config = config
        timeout = httpx.Timeout(
            config.timeout,
            read=config.read_timeout,
            connect=config.connect_timeout,
        )
        self._http_client = http_client or httpx.AsyncClient(timeout=timeout)
        self._owns_client = http_client is None

    def _headers(self) -> dict[str, str]:
        if not self.config.api_key:
            raise RuntimeError("DOCSTRAL_MISTRAL_API_KEY missing")
        return {
            "Authorization": f"Bearer {self.config.api_key}",
            "Content-Type": "application/json",
        }

    def _payload(
        self, messages: list[dict], tools: Optional[list[dict]] = None
    ) -> dict:
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

    async def health_check(self) -> bool:
        """We assume it's always reachable if API key is set."""
        return bool(self.config.api_key)

    async def stream_chat(
        self,
        messages: list[dict],
        tools: Optional[list[dict]] = None,
    ) -> AsyncGenerator[str | dict, None]:
        headers = self._headers()
        payload = self._payload(messages, tools)

        accumulated_tool_calls = {}

        async with self._http_client.stream(
            "POST", self.config.api_url, headers=headers, json=payload
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

                message = ChatCompletionMessage(**delta)
                if message.content:
                    yield message.content

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
