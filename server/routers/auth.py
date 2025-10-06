from fastapi import APIRouter, Depends

from core.security import get_current_user
from models import User
from schemas import UserOut

router = APIRouter(tags=["auth"])


@router.post(
    "/auth/verify",
    summary="Verify token and return the current user",
    response_model=UserOut,
)
def verify_token(current_user: User = Depends(get_current_user)) -> UserOut:
    return UserOut.model_validate(current_user)
