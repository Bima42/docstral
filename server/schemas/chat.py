from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field
from schemas import MessageOut


class ChatOut(BaseModel):
    id: UUID
    user_id: UUID = Field(alias="userId")
    created_at: datetime = Field(alias="createdAt")

    model_config = ConfigDict(
        populate_by_name=True,
        serialize_by_alias=True,
        from_attributes=True,
    )


class ChatDetail(ChatOut):
    messages: list[MessageOut] = []


class ChatCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")
