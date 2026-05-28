"""User-related schemas."""
from __future__ import annotations

from datetime import datetime

from pydantic import Field
from app.schemas.base import BaseSchema


class UserOut(BaseSchema):
    id: str
    username: str
    email: str
    nickname: str
    avatar: str | None = None
    bio: str = ""
    role: str
    is_active: bool = True
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}


class UserUpdate(BaseSchema):
    nickname: str | None = Field(default=None, min_length=1, max_length=32)
    email: str | None = None
    role: str | None = Field(default=None, pattern=r"^(user|admin)$")
    is_active: bool | None = None
