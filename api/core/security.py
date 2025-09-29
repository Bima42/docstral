import hashlib
from datetime import datetime, UTC
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select

from api.core.db import get_session
from api.models import User
from api.models.token import UserToken

bearer_scheme = HTTPBearer(auto_error=True)


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    session: Session = Depends(get_session),
) -> type[User]:
    token = credentials.credentials
    hashed = hash_token(token)

    token_row = session.exec(select(UserToken).where(UserToken.token == hashed)).first()
    if not token_row:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = session.get(User, token_row.user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token_row.last_used_at = datetime.now(UTC)
    session.add(token_row)
    session.commit()

    return user
