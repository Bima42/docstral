from typing import Protocol
from uuid import UUID

from schemas import ChatDetail, ChatOut
from schemas import MessageOut
from models import MessageRole


class ChatRepository(Protocol):
    def list_chats(
        self, user_id: UUID, limit: int = 50, offset: int = 0
    ) -> list[ChatOut]: ...
    def get_chat(self, user_id: UUID, chat_id: UUID) -> ChatDetail | None: ...
    def create_chat(self, user_id: UUID, title: str | None) -> ChatOut: ...
    def update_chat(self, chat_id: UUID, title: str) -> ChatOut: ...
    def delete_chat(self, chat_id: UUID) -> None: ...


class MessageRepository(Protocol):
    def insert_message(
        self,
        chat_id: UUID,
        content: str,
        role: MessageRole = "user",
        latency_ms: int | None = None,
        prompt_tokens: int | None = None,
        completion_tokens: int | None = None,
    ) -> MessageOut: ...
