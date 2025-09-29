from __future__ import annotations

from typing import List
from uuid import UUID

from fastapi import Depends
from sqlalchemy.orm import selectinload
from sqlmodel import Session, select

from api.models import Chat
from api.schemas import ChatDetail, ChatOut
from api.core.db import get_session
from api.repositories.base import ChatRepository


class SQLChatRepository(ChatRepository):
    def __init__(self, session: Session) -> None:
        self.session = session

    def list_chats(self, *, limit: int = 50, offset: int = 0) -> List[ChatOut]:
        statement = (
            select(Chat).order_by(Chat.created_at.desc()).offset(offset).limit(limit)
        )
        chats = self.session.exec(statement).all()
        return [ChatOut.model_validate(c) for c in chats]

    def get_chat(self, chat_id: UUID) -> ChatDetail | None:
        statement = select(Chat).where(Chat.id == chat_id)
        chat = self.session.exec(statement).first()
        if not chat:
            return None
        return ChatDetail.model_validate(chat)


def get_chat_repo(session: Session = Depends(get_session)) -> ChatRepository:
    return SQLChatRepository(session)
