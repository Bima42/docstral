from uuid import UUID

from fastapi import Depends
from sqlmodel import Session

from models import Message, MessageRole
from schemas import MessageOut
from repositories import MessageRepository
from core.db import get_session


class SQLMessageRepository(MessageRepository):
    def __init__(self, session: Session) -> None:
        self.session = session

    def insert_message(
        self, *, chat_id: UUID, content: str, role: MessageRole = "user"
    ) -> MessageOut:
        message = Message(chat_id=chat_id, role=role, content=content)
        self.session.add(message)
        self.session.commit()
        self.session.refresh(message)
        return MessageOut.model_validate(message)

    def update_message_metrics(
        self,
        message_id: UUID,
        latency_ms: int | None = None,
        prompt_tokens: int | None = None,
        completion_tokens: int | None = None,
    ) -> None:
        """Update metrics for an assistant message."""
        msg = self.session.get(Message, message_id)
        if msg:
            if latency_ms is not None:
                msg.latency_ms = latency_ms
            if prompt_tokens is not None:
                msg.prompt_tokens = prompt_tokens
            if completion_tokens is not None:
                msg.completion_tokens = completion_tokens
            self.session.add(msg)
            self.session.commit()


def get_message_repo(session: Session = Depends(get_session)) -> MessageRepository:
    return SQLMessageRepository(session)
