"""Category-related schemas."""
from __future__ import annotations

from datetime import datetime

from pydantic import Field
from app.schemas.base import BaseSchema


class CategoryOut(BaseSchema):
    id: str
    name: str
    slug: str
    description: str = ""
    article_count: int = 0
    order: int = 0
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


class CategoryCreate(BaseSchema):
    name: str = Field(..., min_length=1, max_length=32)
    slug: str | None = Field(default=None, max_length=64)
    description: str | None = Field(default="", max_length=200)
    order: int = 0


class CategoryUpdate(BaseSchema):
    name: str | None = Field(default=None, min_length=1, max_length=32)
    slug: str | None = Field(default=None, max_length=64)
    description: str | None = Field(default=None, max_length=200)
    order: int | None = None
