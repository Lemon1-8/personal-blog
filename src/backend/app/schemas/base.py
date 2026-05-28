"""Base schema with common validation logic."""
from __future__ import annotations

import uuid

from pydantic import BaseModel, model_validator


class BaseSchema(BaseModel):
    """Base schema with UUID-to-string conversion on validation."""

    @model_validator(mode="before")
    @classmethod
    def _convert_uuids(cls, data):
        """Convert any UUID objects to strings before validation."""
        if isinstance(data, dict):
            for key, value in data.items():
                if isinstance(value, uuid.UUID):
                    data[key] = str(value)
        elif hasattr(data, "__dict__"):
            # ORM model instance
            for key in [c for c in dir(data) if not c.startswith("_")]:
                try:
                    val = getattr(data, key)
                    if isinstance(val, uuid.UUID):
                        setattr(data, key, str(val))
                except Exception:
                    pass
        return data
