import logging
from typing import Literal

from llm import LLMClient
from llm import MistralLLMClient, MistralConfig
from llm import SelfHostedLLMClient, SelfHostedConfig
from schemas.health import LLMMode

logger = logging.getLogger(__name__)


class LLMClientFactory:
    """
    Factory that probes self-hosted LLM on startup, falls back to Mistral if unavailable.
    Call `create()` once at app startup and inject the result globally.
    """

    _mode: LLMMode | None = None

    @classmethod
    async def create(cls) -> LLMClient:
        """
        1. Try self-hosted if SELF_HOSTED_LLM_URL is set and /health responds.
        2. Fall back to Mistral API.
        """
        self_hosted_config = SelfHostedConfig.from_env()

        if self_hosted_config:
            client = SelfHostedLLMClient(self_hosted_config)
            logger.info(f"Probing self-hosted LLM at {self_hosted_config.base_url}...")
            if await client.health_check():
                logger.info(
                    "✅ Self-hosted LLM is healthy. Using self-hosted provider."
                )
                cls._mode = LLMMode.SELF_HOSTED
                return client
            else:
                logger.warning(
                    "❌ Self-hosted LLM unreachable. Falling back to Mistral API."
                )

        mistral_config = MistralConfig.from_env()
        logger.info("Using Mistral API as LLM provider.")
        cls._mode = LLMMode.API
        return MistralLLMClient(mistral_config)

    @classmethod
    def get_mode(cls) -> LLMMode:
        """Return the current LLM mode. Must be called after create()."""
        if cls._mode is None:
            raise RuntimeError("LLMClientFactory.create() has not been called yet.")
        return cls._mode
