import os
import httpx
from typing import Optional

from llm.client.base import LLMConfig, LLMClient


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
        super().__init__(config, http_client)
        self.config: MistralConfig = config

    def _build_url(self) -> str:
        return self.config.api_url

    def _build_headers(self) -> dict[str, str]:
        if not self.config.api_key:
            raise RuntimeError("DOCSTRAL_MISTRAL_API_KEY missing")
        return {
            "Authorization": f"Bearer {self.config.api_key}",
            "Content-Type": "application/json",
        }

    async def health_check(self) -> bool:
        """We assume it's always reachable if API key is set."""
        return bool(self.config.api_key)
