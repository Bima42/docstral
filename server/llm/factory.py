import logging
import os
from .client import LLMClient
from .config import SelfHostedConfig, MistralConfig
from schemas.health import LLMMode

logger = logging.getLogger(__name__)


class LLMClientFactory:
    """Factory to create LLM client based on deployment mode."""

    @classmethod
    async def create(cls) -> LLMClient:
        """
        Create LLM client from environment variables.
        Priority: self-hosted > API.

        Returns:
            Configured LLMClient instance.
        """
        mode = os.getenv("LLM_MODE", LLMMode.API).strip().lower()
        if mode == LLMMode.SELF_HOSTED:
            config = SelfHostedConfig.from_env()
            logger.info(f"LLM client: Self-hosted mode at {config.base_url}")
            cls._mode = LLMMode.SELF_HOSTED
            return LLMClient(config=config, mode=LLMMode.SELF_HOSTED)

        logger.info("LLM client: Mistral API mode")
        cls._mode = LLMMode.API
        config = MistralConfig.from_env()
        return LLMClient(config=config, mode=LLMMode.API)
