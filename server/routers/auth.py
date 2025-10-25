from fastapi import APIRouter, Depends, HTTPException
from fastapi_limiter.depends import RateLimiter
from pydantic import EmailStr, BaseModel
from sqlmodel import Session, select
from starlette import status

from core.auth import get_current_user, verify_admin_token
from core.db import get_session
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


class CreateUserRequest(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str


@router.post(
    "/auth/admin/create-user",
    summary="Create a new user (Admin only)",
    response_model=UserOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(verify_admin_token)],
)
def create_user(
    user_data: CreateUserRequest,
    db: Session = Depends(get_session),
) -> UserOut:
    """Create a new user. Requires admin token in Authorization header."""
    statement = select(User).where(User.email == user_data.email)
    existing_user = db.exec(statement).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User with this email already exists",
        )

    new_user = User(
        email=user_data.email,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return UserOut.model_validate(new_user)
