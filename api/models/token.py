import uuid
from datetime import datetime, UTC
from sqlalchemy import Column, DateTime, String, UniqueConstraint
from sqlmodel import Field, SQLModel


class UserToken(SQLModel, table=True):
    __tablename__ = "user_tokens"
    __table_args__ = (UniqueConstraint("token", name="uq_user_tokens_token"),)

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True, nullable=False)
    token: str = Field(
        sa_column=Column(String(128), index=True, unique=True, nullable=False),
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )
    last_used_at: datetime | None = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), nullable=True),
    )
