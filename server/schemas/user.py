from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class UserOut(BaseModel):
    id: UUID
    first_name: str = Field(alias="firstName")
    last_name: str = Field(alias="lastName")
    email: str

    model_config = ConfigDict(
        populate_by_name=True,
        serialize_by_alias=True,
        from_attributes=True,
    )
