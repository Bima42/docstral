from datetime import datetime, timezone
from fastapi import APIRouter

from llm import LLMClientFactory
from schemas.health import HealthOut

router = APIRouter(tags=["health"])


@router.get("/health", summary="Health check")
def health() -> HealthOut:
    now = datetime.now(timezone.utc).isoformat()
    mode = LLMClientFactory.get_mode()

    return HealthOut.model_validate(
        {
            "status": "ok",
            "time": now,
            "mode": mode,
        }
    )
