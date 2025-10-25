from datetime import datetime, timezone
from fastapi import APIRouter

from llm import LLMClientFactory, get_llm_client
from schemas.health import HealthOut

router = APIRouter(tags=["health"])


@router.get(
    "/health",
    summary="Get service health status",
    operation_id="health_get",
    response_model=HealthOut,
)
def health() -> HealthOut:
    now = datetime.now(timezone.utc).isoformat()
    mode = get_llm_client().mode

    return HealthOut.model_validate(
        {
            "status": "ok",
            "time": now,
            "mode": mode,
        }
    )
