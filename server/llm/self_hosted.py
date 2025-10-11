import json
import os
import httpx
import logging

from typing import AsyncGenerator, Optional

from starlette.status import HTTP_200_OK

from llm import LLMClient, LLMConfig
from schemas.llm import ChatCompletionMessage

logger = logging.getLogger(__name__)


class SelfHostedConfig(LLMConfig):
    base_url: str
    model: str = "default"
    api_key: str

    @staticmethod
    def from_env() -> Optional["SelfHostedConfig"]:
        base_url = os.getenv("SELF_HOSTED_LLM_URL", "").strip()
        if not base_url:
            return None

        model = os.getenv(
            "SELF_HOSTED_MODEL", "mistralai/Mistral-7B-Instruct-v0.3"
        ).strip()
        api_key = os.getenv("SELF_HOSTED_API_KEY", "").strip()
        if not api_key:
            return None

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
        timeout = httpx.Timeout(
            config.timeout,
            read=config.read_timeout,
            connect=config.connect_timeout,
        )
        self._http_client = http_client or httpx.AsyncClient(timeout=timeout)
        self._owns_client = http_client is None

    def _headers(self) -> dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if self.config.api_key:
            headers["Authorization"] = f"Bearer {self.config.api_key}"
        return headers

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
        """Ping endpoint on the self-hosted vLLM instance."""
        health_url = f"{self.config.base_url.rstrip('/')}/v1/models"

        timeout = httpx.Timeout(connect=5.0, read=30.0, write=5.0, pool=5.0)
        headers = self._headers()

        try:
            resp = await self._http_client.get(
                health_url, timeout=timeout, headers=headers
            )
            return resp.status_code == HTTP_200_OK
        except Exception:
            return False

    async def stream_chat(
        self,
        messages: list[dict],
        tools: Optional[list[dict]] = None,
    ) -> AsyncGenerator[str | dict, None]:
        completions_url = f"{self.config.base_url.rstrip('/')}/v1/chat/completions"
        headers = self._headers()
        payload = self._payload(messages, tools)

        accumulated_tool_calls = {}

        async with self._http_client.stream(
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

                choice = event.get("choices", [{}])[0]
                delta = choice.get("delta", {})
                finish_reason = choice.get("finish_reason")

                # Handle tool call deltas
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
