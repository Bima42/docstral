from typing import Protocol
from uuid import UUID

from api.schemas import ChatDetail, ChatOut
from api.schemas import MessageOut


class ChatRepository(Protocol):
    def list_chats(
        self, *, user_id: UUID, limit: int = 50, offset: int = 0
    ) -> list[ChatOut]: ...
    def get_chat(self, *, user_id: UUID, chat_id: UUID) -> ChatDetail | None: ...


class MessageRepository(Protocol):
    def insert_message(self, *, chat_id: UUID, content: str) -> MessageOut: ...
