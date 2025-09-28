from datetime import datetime, timezone
from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health", summary="Health check")
def health() -> dict:
    now = datetime.now(timezone.utc).isoformat()
    return {
        "status": "ok",
        "time": now,
    }
