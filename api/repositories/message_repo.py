from uuid import UUID

from fastapi import Depends
from sqlmodel import Session

from api.models import Message, MessageRole
from api.schemas import MessageOut
from api.repositories import MessageRepository
from api.core.db import get_session


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


def get_message_repo(session: Session = Depends(get_session)) -> MessageRepository:
    return SQLMessageRepository(session)
