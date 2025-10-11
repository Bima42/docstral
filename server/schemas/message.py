from datetime import datetime
from uuid import UUID

from pydantic import Field, BaseModel, ConfigDict

from models import MessageRole


class MessageOut(BaseModel):
    id: UUID
    chat_id: UUID = Field(alias="chatId")
    role: MessageRole
    content: str
    created_at: datetime = Field(alias="createdAt")

    model_config = ConfigDict(
        populate_by_name=True,
        serialize_by_alias=True,
        from_attributes=True,
    )


class MessageCreate(BaseModel):
    content: str
    use_rag: bool = True

    model_config = ConfigDict(extra="forbid")
