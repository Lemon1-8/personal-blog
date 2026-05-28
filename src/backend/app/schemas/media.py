"""Media-related schemas."""
from __future__ import annotations

from datetime import datetime

from app.schemas.base import BaseSchema


class MediaOut(BaseSchema):
    id: str
    url: str
    thumbnail_url: str | None = None
    large_url: str | None = None
    filename: str
    stored_filename: str
    size: int
    width: int | None = None
    height: int | None = None
    mime_type: str
    upload_type: str
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


class MediaUploaded(BaseSchema):
    id: str
    url: str
    thumbnail_url: str | None = None
    large_url: str | None = None
    filename: str
    size: int
    width: int | None = None
    height: int | None = None
    mime_type: str
    created_at: datetime | None = None
