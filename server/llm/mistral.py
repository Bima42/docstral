import json
import os
import httpx

from typing import AsyncGenerator, Optional

from llm import LLMClient, LLMConfig
from schemas.llm import ChatCompletionMessage


class MistralConfig(LLMConfig):
    api_key: str
    api_url: str = "https://api.mistral.ai/v1/chat/completions"
    model: str = "mistral-small-latest"

    @staticmethod
    def from_env() -> "MistralConfig":
        api_key = os.getenv("DOCSTRAL_MISTRAL_API_KEY", "").strip()
        model = os.getenv("DOCSTRAL_MISTRAL_MODEL", "mistral-small-latest").strip()
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
        self._http_client = http_client

    def _headers(self) -> dict[str, str]:
        if not self.config.api_key:
            raise RuntimeError("DOCSTRAL_MISTRAL_API_KEY missing")
        return {
            "Authorization": f"Bearer {self.config.api_key}",
            "Content-Type": "application/json",
        }

    def _payload(self, messages: list[dict]) -> dict:
        return {
            "model": self.config.model,
            "messages": messages,
            "temperature": self.config.temperature,
            "stream": True,
        }

    async def health_check(self) -> bool:
        """We assume it's always reachable if API key is set."""
        return bool(self.config.api_key)

    async def stream_chat(self, messages: list[dict]) -> AsyncGenerator[str, None]:
        timeout = httpx.Timeout(
            self.config.timeout,
            read=self.config.read_timeout,
            connect=self.config.connect_timeout,
        )

        if self._http_client is None:
            async with httpx.AsyncClient(timeout=timeout) as client:
                async for token in self._stream_with_client(client, messages):
                    yield token
        else:
            async for token in self._stream_with_client(self._http_client, messages):
                yield token

    async def _stream_with_client(
        self, client: httpx.AsyncClient, messages: list[dict]
    ) -> AsyncGenerator[str, None]:
        headers = self._headers()
        payload = self._payload(messages)

        async with client.stream(
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

                delta = event.get("choices", [{}])[0].get("delta", {})
                message = ChatCompletionMessage(**delta)
                if message.content:
                    yield message.content
