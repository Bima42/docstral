from uuid import UUID
from pydantic import BaseModel, ConfigDict


class UserOut(BaseModel):
    id: UUID
    name: str

    model_config = ConfigDict(
        populate_by_name=True,
        serialize_by_alias=True,
        from_attributes=True,
    )
