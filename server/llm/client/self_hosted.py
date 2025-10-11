import os
import httpx
from typing import Optional

from starlette.status import HTTP_200_OK

from llm.client.base import LLMConfig, LLMClient


class SelfHostedConfig(LLMConfig):
    base_url: str
    model: str = "mistralai/Mistral-7B-Instruct-v0.3"
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
        self,
        config: SelfHostedConfig,
        http_client: Optional[httpx.AsyncClient] = None,
    ):
        super().__init__(config, http_client)
        self.config: SelfHostedConfig = config

    def _build_url(self) -> str:
        return f"{self.config.base_url.rstrip('/')}/v1/chat/completions"

    def _build_headers(self) -> dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if self.config.api_key:
            headers["Authorization"] = f"Bearer {self.config.api_key}"
        return headers

    async def health_check(self) -> bool:
        """Ping /v1/models endpoint on the self-hosted vLLM instance."""
        health_url = f"{self.config.base_url.rstrip('/')}/v1/models"
        timeout = httpx.Timeout(connect=5.0, read=30.0, write=5.0, pool=5.0)
        headers = self._build_headers()

        try:
            resp = await self._http_client.get(
                health_url, timeout=timeout, headers=headers
            )
            return resp.status_code == HTTP_200_OK
        except Exception:
            return False
