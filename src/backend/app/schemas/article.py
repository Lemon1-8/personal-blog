"""Article-related schemas."""
from __future__ import annotations

from datetime import datetime

from pydantic import Field
from app.schemas.base import BaseSchema


class AuthorBrief(BaseSchema):
    id: str
    nickname: str
    avatar: str | None = None

    model_config = {"from_attributes": True}


class CategoryBrief(BaseSchema):
    id: str
    name: str
    slug: str

    model_config = {"from_attributes": True}


class TagBrief(BaseSchema):
    id: str
    name: str
    slug: str

    model_config = {"from_attributes": True}


class ArticleListItem(BaseSchema):
    id: str
    title: str
    slug: str
    summary: str
    cover_image: str | None = None
    category: CategoryBrief | None = None
    tags: list[TagBrief] = []
    author: AuthorBrief
    views_count: int = 0
    likes_count: int = 0
    comment_count: int = 0
    is_pinned: bool = False
    published_at: datetime | None = None
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


class ArticleDetail(BaseSchema):
    id: str
    title: str
    slug: str
    summary: str
    content: str
    content_type: str = "html"
    cover_image: str | None = None
    category: CategoryBrief | None = None
    tags: list[TagBrief] = []
    author: AuthorBrief
    views_count: int = 0
    likes_count: int = 0
    favorites_count: int = 0
    comment_count: int = 0
    is_pinned: bool = False
    is_liked: bool = False
    is_favorited: bool = False
    published_at: datetime | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None
    prev_article: dict | None = None
    next_article: dict | None = None

    model_config = {"from_attributes": True}


class ArticleCreate(BaseSchema):
    title: str = Field(..., min_length=1, max_length=200)
    slug: str | None = Field(default=None, max_length=255)
    summary: str | None = Field(default="", max_length=500)
    content: str = Field(..., min_length=1)
    content_type: str = Field(default="html", pattern=r"^(html|markdown)$")
    cover_image: str | None = Field(default=None, max_length=512)
    category_id: str | None = None
    tag_ids: list[str] = []
    is_pinned: bool = False
    status: str = Field(default="draft", pattern=r"^(draft|published)$")


class ArticleUpdate(BaseSchema):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    slug: str | None = Field(default=None, max_length=255)
    summary: str | None = Field(default=None, max_length=500)
    content: str | None = None
    content_type: str | None = Field(default=None, pattern=r"^(html|markdown)$")
    cover_image: str | None = Field(default=None, max_length=512)
    category_id: str | None = None
    tag_ids: list[str] | None = None
    is_pinned: bool | None = None
    status: str | None = Field(default=None, pattern=r"^(draft|published)$")


class ArticleStatusUpdate(BaseSchema):
    status: str = Field(..., pattern=r"^(draft|published)$")


class ArticleCreated(BaseSchema):
    id: str
    slug: str


class LikeResponse(BaseSchema):
    is_liked: bool
    likes_count: int


class FavoriteResponse(BaseSchema):
    is_favorited: bool
    favorites_count: int


class ArticleNav(BaseSchema):
    id: str
    title: str
    slug: str
