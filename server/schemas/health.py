from enum import Enum

from pydantic import BaseModel, Field
from datetime import datetime


class LLMMode(str, Enum):
    API = "API"
    SELF_HOSTED = "Self-hosted"


class HealthOut(BaseModel):
    status: str = "ok"
    time: datetime
    mode: LLMMode
