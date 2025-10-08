import json
import os
import httpx

from typing import AsyncGenerator, Optional

from starlette.status import HTTP_200_OK

from llm import LLMClient, LLMConfig
from schemas.llm import ChatCompletionMessage


class SelfHostedConfig(LLMConfig):
    base_url: str
    model: str = "default"
    api_key: Optional[str] = None

    @staticmethod
    def from_env() -> Optional["SelfHostedConfig"]:
        base_url = os.getenv("SELF_HOSTED_LLM_URL", "").strip()
        if not base_url:
            return None

        model = os.getenv("SELF_HOSTED_MODEL", "default").strip()
        api_key = os.getenv("SELF_HOSTED_API_KEY", "").strip() or None

        return SelfHostedConfig(
            base_url=base_url,
            model=model,
            api_key=api_key,
        )


class SelfHostedLLMClient(LLMClient):
    def __init__(
        self, config: SelfHostedConfig, http_client: Optional[httpx.AsyncClient] = None
    ):
        self.config = config
        self._http_client = http_client

    def _headers(self) -> dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if self.config.api_key:
            headers["Authorization"] = f"Bearer {self.config.api_key}"
        return headers

    def _payload(self, messages: list[dict]) -> dict:
        return {
            "model": self.config.model,
            "messages": messages,
            "temperature": self.config.temperature,
            "stream": True,
        }

    async def health_check(self) -> bool:
        """Ping /health on the self-hosted vLLM instance."""
        health_url = f"{self.config.base_url.rstrip('/')}/health"
        timeout = httpx.Timeout(connect=5.0, read=5.0)

        try:
            if self._http_client:
                resp = await self._http_client.get(health_url, timeout=timeout)
            else:
                async with httpx.AsyncClient(timeout=timeout) as client:
                    resp = await client.get(health_url)
            return resp.status_code == HTTP_200_OK
        except Exception:
            return False

    async def stream_chat(self, messages: list[dict]) -> AsyncGenerator[str, None]:
        completions_url = f"{self.config.base_url.rstrip('/')}/v1/chat/completions"
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
        completions_url = f"{self.config.base_url.rstrip('/')}/v1/chat/completions"
        headers = self._headers()
        payload = self._payload(messages)

        async with client.stream(
            "POST", completions_url, headers=headers, json=payload
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
