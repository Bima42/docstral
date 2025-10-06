from fastapi import APIRouter, Depends
from fastapi_limiter.depends import RateLimiter

from core.auth import get_current_user
from core.rate_limiter import AUTH_REQUESTS, AUTH_WINDOW
from models import User
from schemas import UserOut

router = APIRouter(tags=["auth"])


@router.post(
    "/auth/verify",
    summary="Verify token and return the current user",
    response_model=UserOut,
    dependencies=[Depends(RateLimiter(times=AUTH_REQUESTS, seconds=AUTH_WINDOW))],
)
def verify_token(current_user: User = Depends(get_current_user)) -> UserOut:
    return UserOut.model_validate(current_user)
