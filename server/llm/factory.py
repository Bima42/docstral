import logging

from llm import LLMClient
from llm import MistralLLMClient, MistralConfig
from llm import SelfHostedLLMClient, SelfHostedConfig

logger = logging.getLogger(__name__)


class LLMClientFactory:
    """
    Factory that probes self-hosted LLM on startup, falls back to Mistral if unavailable.
    Call `create()` once at app startup and inject the result globally.
    """

    @staticmethod
    async def create() -> LLMClient:
        """
        1. Try self-hosted if SELF_HOSTED_LLM_URL is set and /health responds.
        2. Fall back to Mistral API.
        """
        self_hosted_config = SelfHostedConfig.from_env()

        if self_hosted_config:
            client = SelfHostedLLMClient(self_hosted_config)
            logger.info(
                f"Probing self-hosted LLM at {self_hosted_config.base_url}/health..."
            )
            if await client.health_check():
                logger.info(
                    "✅ Self-hosted LLM is healthy. Using self-hosted provider."
                )
                return client
            else:
                logger.warning(
                    "❌ Self-hosted LLM unreachable. Falling back to Mistral API."
                )

        mistral_config = MistralConfig.from_env()
        logger.info("Using Mistral API as LLM provider.")
        return MistralLLMClient(mistral_config)
