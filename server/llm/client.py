import logging
import time
from typing import AsyncGenerator
from mistralai import Mistral

from schemas.health import LLMMode
from .config import LLMConfig

logger = logging.getLogger(__name__)


class LLMClient:
    """Minimal async client for Mistral API and self-hosted models."""

    def __init__(self, config: LLMConfig, mode: LLMMode):
        self.config: LLMConfig = config
        self.mode: LLMMode = mode
        self.client = Mistral(
            api_key=config.api_key or "",
            server_url=config.base_url,
            timeout_ms=int(config.timeout * 1000),
        )
        logger.info(f"LLM client initialized: {config.model} at {config.base_url}")

    async def invoke(
        self,
        messages: list[dict],
        tools: list[dict] | None = None,
    ) -> tuple[str, dict, list[dict] | None]:
        """
        Standard completion call.

        Args:
            messages: List of message dicts with 'role' and 'content'.
            tools: Optional list of tool definitions for function calling.

        Returns:
            (content, usage_dict, tool_calls) where:
                - content: str response text
                - usage_dict: {prompt_tokens, completion_tokens, latency_ms}
                - tool_calls: list of tool call dicts or None

        Raises:
            Exception: On API errors.
        """
        start = time.perf_counter()

        try:
            response = await self.client.chat.complete_async(
                model=self.config.model,
                messages=messages,
                temperature=self.config.temperature,
                tools=tools,
            )
        except Exception as e:
            logger.error(f"LLM invoke failed: {e}")
            raise

        latency_ms = int((time.perf_counter() - start) * 1000)

        choice = response.choices[0]
        content = choice.message.content or ""
        tool_calls = None

        if choice.message.tool_calls:
            tool_calls = [
                {
                    "id": tc.id,
                    "function": {
                        "name": tc.function.name,
                        "arguments": tc.function.arguments,
                    },
                }
                for tc in choice.message.tool_calls
            ]

        usage = {
            "prompt_tokens": response.usage.prompt_tokens,
            "completion_tokens": response.usage.completion_tokens,
            "latency_ms": latency_ms,
        }

        logger.debug(
            f"LLM invoke: {len(content)} chars, "
            f"{usage['prompt_tokens']}+{usage['completion_tokens']} tokens, "
            f"{latency_ms}ms, tool_calls={bool(tool_calls)}"
        )

        return content, usage, tool_calls

    async def stream(
        self,
        messages: list[dict],
        tools: list[dict] | None = None,
    ) -> AsyncGenerator[tuple[str, dict | None], None]:
        """
        Streaming completion call.

        Args:
            messages: List of message dicts.
            tools: Optional tool definitions.

        Yields:
            (chunk, usage) tuples where:
                - chunk: Text content (str)
                - usage: Usage dict on final chunk, None otherwise
                  Format: {prompt_tokens, completion_tokens, latency_ms}

        Example:
            async for chunk, usage in client.stream(messages):
                print(chunk, end="")
                if usage:
                    print(f"\nTokens: {usage['prompt_tokens']}+{usage['completion_tokens']}")
        """
        start = time.perf_counter()

        try:
            stream = await self.client.chat.stream_async(
                model=self.config.model,
                messages=messages,
                temperature=self.config.temperature,
                tools=tools,
            )

            async for chunk in stream:
                delta = chunk.data.choices[0].delta
                content = delta.content or ""

                # Check if this is the final chunk with usage
                usage_dict = None
                if chunk.data.usage:
                    latency_ms = int((time.perf_counter() - start) * 1000)
                    usage_dict = {
                        "prompt_tokens": chunk.data.usage.prompt_tokens,
                        "completion_tokens": chunk.data.usage.completion_tokens,
                        "latency_ms": latency_ms,
                    }
                    logger.debug(
                        f"LLM stream complete: "
                        f"{usage_dict['prompt_tokens']}+{usage_dict['completion_tokens']} tokens, "
                        f"{latency_ms}ms"
                    )

                yield content, usage_dict

        except Exception as e:
            logger.error(f"LLM stream failed: {e}")
            raise


# Singleton pattern for DI
_llm_client_instance: LLMClient | None = None


def set_llm_client(client: LLMClient):
    global _llm_client_instance
    _llm_client_instance = client


def get_llm_client() -> LLMClient:
    if _llm_client_instance is None:
        raise RuntimeError("LLM client not initialized. Call set_llm_client() first.")
    return _llm_client_instance
