from datetime import datetime
from typing import List
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field

from api.schemas import MessageOut


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
    messages: List[MessageOut] = Field(default_factory=list)


class ChatCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")
