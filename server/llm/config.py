import os
from pydantic import BaseModel

from core.settings import settings


class LLMConfig(BaseModel):
    model: str
    base_url: str
    api_key: str
    temperature: float = 0.1
    timeout: float = 60.0


class MistralConfig(LLMConfig):
    api_key: str
    base_url: str = "https://api.mistral.ai"
    model: str = "ministral-3b-2410"

    @staticmethod
    def from_env() -> "MistralConfig":
        api_key = settings.MISTRAL_API_KEY
        model = os.getenv("DOCSTRAL_MISTRAL_MODEL", "ministral-3b-2410").strip()
        base_url = os.getenv(
            "DOCSTRAL_MISTRAL_BASE_URL", "https://api.mistral.ai"
        ).strip()

        return MistralConfig(
            base_url=base_url,
            api_key=api_key,
            model=model,
        )


class SelfHostedConfig(LLMConfig):
    base_url: str
    api_key: str
    model: str = "mistralai/Mistral-7B-Instruct-v0.3"

    @staticmethod
    def from_env() -> "SelfHostedConfig | None":
        base_url = settings.SELF_HOSTED_LLM_URL
        api_key = settings.SELF_HOSTED_API_KEY

        if not base_url or not api_key:
            return None

        model = os.getenv(
            "SELF_HOSTED_MODEL", "mistralai/Mistral-7B-Instruct-v0.3"
        ).strip()

        return SelfHostedConfig(
            base_url=base_url,
            model=model,
            api_key=api_key,
        )
