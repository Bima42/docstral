import uuid
from datetime import datetime, UTC
from enum import Enum
from typing import TYPE_CHECKING

from sqlalchemy import Column, DateTime
from sqlmodel import Field, Relationship, SQLModel


if TYPE_CHECKING:
    from .chat import Chat


class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class Message(SQLModel, table=True):
    __tablename__ = "messages"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    chat_id: uuid.UUID = Field(foreign_key="chats.id", index=True, nullable=False)
    role: MessageRole = Field(nullable=False)
    content: str = Field(nullable=False)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )

    # Relationships
    chat: "Chat" = Relationship(back_populates="messages")
