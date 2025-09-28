from __future__ import annotations

from typing import Protocol
from uuid import UUID

from api.schemas import ChatDetail, ChatOut


class ChatRepository(Protocol):
    def list_chats(self, *, limit: int = 50, offset: int = 0) -> list[ChatOut]: ...
    def get_chat(self, chat_id: UUID) -> ChatDetail | None: ...
