from typing import List
from uuid import UUID

from fastapi import Depends
from sqlmodel import Session, select

from models import Chat
from schemas import ChatDetail, ChatOut
from core.db import get_session
from repositories.base import ChatRepository


class SQLChatRepository(ChatRepository):
    def __init__(self, session: Session) -> None:
        self.session = session

    def list_chats(
        self, *, user_id: UUID, limit: int = 50, offset: int = 0
    ) -> List[ChatOut]:
        statement = (
            select(Chat)
            .where(Chat.user_id == user_id)
            .order_by(Chat.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        chats = self.session.exec(statement).all()
        return [ChatOut.model_validate(c) for c in chats]

    def get_chat(self, *, user_id: UUID, chat_id: UUID) -> ChatDetail | None:
        statement = select(Chat).where(Chat.id == chat_id, Chat.user_id == user_id)
        chat = self.session.exec(statement).first()
        if not chat:
            return None
        return ChatDetail.model_validate(chat)

    def create_chat(self, *, user_id: UUID, title: str | None = None) -> Chat:
        chat = Chat(user_id=user_id, title=title or "New Chat")
        self.session.add(chat)
        self.session.commit()
        self.session.refresh(chat)
        return chat


def get_chat_repo(session: Session = Depends(get_session)) -> ChatRepository:
    return SQLChatRepository(session)
