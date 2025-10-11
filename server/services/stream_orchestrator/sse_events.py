from typing import Literal
from pydantic import BaseModel


class SourceReference(BaseModel):
    title: str
    url: str


class SSEStartEvent(BaseModel):
    type: Literal["start"] = "start"


class SSETokenEvent(BaseModel):
    type: Literal["token"] = "token"
    content: str


class SSESourcesEvent(BaseModel):
    type: Literal["sources"] = "sources"
    data: list[SourceReference]


class SSEDoneEvent(BaseModel):
    type: Literal["done"] = "done"


class SSEErrorEvent(BaseModel):
    type: Literal["error"] = "error"
    message: str


SSEEvent = (
    SSEStartEvent | SSETokenEvent | SSESourcesEvent | SSEDoneEvent | SSEErrorEvent
)
