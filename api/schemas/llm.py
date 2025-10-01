from enum import Enum

from pydantic import BaseModel


class UsageInfo(BaseModel):
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int
    prompt_audio_seconds: float | None = None


class FinishReason(str, Enum):
    STOP = "stop"
    LENGTH = "length"
    MODEL_LENGTH = "model_length"
    TOOL_CALLS = "tool_calls"
    ERROR = "error"


class ChatCompletionMessage(BaseModel):
    role: str = None
    content: str | list[str] = None
    tool_calls: list[dict] | None = None


class ChatCompletionChoice(BaseModel):
    index: int
    delta: ChatCompletionMessage
    finish_reason: FinishReason
