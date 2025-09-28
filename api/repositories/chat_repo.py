from __future__ import annotations

import uuid
from datetime import datetime, UTC, timedelta

from api.schemas import ChatDetail, ChatOut
from api.schemas import MessageOut
from api.models import MessageRole


class InMemoryChatRepository:
    """
    Temporary repository ysed for testing purpose only, before connecting a DB.
    """

    def __init__(self) -> None:
        now = datetime.now(UTC)

        chat_id = "123e4567-e89b-12d3-a456-426614174001"
        user_id = "123e4567-e89b-12d3-a456-426614174000"

        self._chats: list[ChatDetail] = [
            ChatDetail(
                id=chat_id,
                userId=user_id,
                createdAt=now - timedelta(hours=1),
                messages=[
                    MessageOut(
                        id=uuid.uuid4(),
                        chatId=chat_id,
                        role=MessageRole.USER,
                        content="Hello!",
                        createdAt=now - timedelta(hours=1),
                    ),
                    MessageOut(
                        id=uuid.uuid4(),
                        chatId=chat_id,
                        role=MessageRole.ASSISTANT,
                        content="Hi! How can I help?",
                        createdAt=now - timedelta(hours=1, minutes=59),
                    ),
                ],
            )
        ]

    def list_chats(self, *, limit: int = 50, offset: int = 0) -> list[ChatOut]:
        items = self._chats[offset : offset + limit]
        return [ChatOut(**c.model_dump()) for c in items]

    def get_chat(self, chat_id: uuid.UUID) -> ChatDetail | None:
        for chat in self._chats:
            if chat.id == chat_id:
                return chat
        return None


_REPO = InMemoryChatRepository()


def get_chat_repo() -> InMemoryChatRepository:
    return _REPO
