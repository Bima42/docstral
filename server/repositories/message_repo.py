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
        self,
        chat_id: UUID,
        content: str,
        role: MessageRole = "user",
        latency_ms: int | None = None,
        prompt_tokens: int | None = None,
        completion_tokens: int | None = None,
    ) -> MessageOut:
        message = Message(
            chat_id=chat_id,
            role=role,
            content=content,
            latency_ms=latency_ms,
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
        )
        self.session.add(message)
        self.session.commit()
        self.session.refresh(message)
        return MessageOut.model_validate(message)

    def update_message_content(
        self,
        message_id: UUID,
        new_content: str,
    ) -> MessageOut:
        message = self.session.get(Message, message_id)
        if not message:
            raise ValueError("Message not found")
        message.content = new_content
        self.session.commit()
        self.session.refresh(message)
        return MessageOut.model_validate(message)


def get_message_repo(session: Session = Depends(get_session)) -> MessageRepository:
    return SQLMessageRepository(session)
