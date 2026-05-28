"""Tag-related schemas."""
from __future__ import annotations

from datetime import datetime

from pydantic import Field
from app.schemas.base import BaseSchema


class TagOut(BaseSchema):
    id: str
    name: str
    slug: str
    article_count: int = 0
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


class TagCreate(BaseSchema):
    name: str = Field(..., min_length=1, max_length=32)
    slug: str | None = Field(default=None, max_length=64)


class TagUpdate(BaseSchema):
    name: str | None = Field(default=None, min_length=1, max_length=32)
    slug: str | None = Field(default=None, max_length=64)


class TagHotQuery(BaseSchema):
    limit: int = Field(default=10, ge=1, le=30)
