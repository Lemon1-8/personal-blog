"""Common schemas: unified response, pagination."""
from __future__ import annotations

from typing import Generic, TypeVar

from pydantic import Field

from app.schemas.base import BaseSchema

T = TypeVar("T")


class ApiResponse(BaseSchema, Generic[T]):
    """Unified API response."""
    code: int = 0
    message: str = "ok"
    data: T | None = None


class PaginatedData(BaseSchema, Generic[T]):
    """Paginated list wrapper."""
    items: list[T]
    total: int
    page: int
    page_size: int
    total_pages: int


class PaginationParams(BaseSchema):
    """Pagination query parameters."""
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=50)
