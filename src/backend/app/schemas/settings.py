"""Settings-related schemas."""
from __future__ import annotations

from pydantic import Field
from app.schemas.base import BaseSchema


class PublicSettingsOut(BaseSchema):
    site_name: str = "My Blog"
    site_description: str = ""
    site_logo: str | None = None
    favicon: str | None = None
    social_links: dict = {}

    model_config = {"from_attributes": True}


class SettingsUpdate(BaseSchema):
    site_name: str | None = Field(default=None, max_length=100)
    site_description: str | None = Field(default=None, max_length=300)
    site_logo: str | None = None
    favicon: str | None = None
    social_github: str | None = None
    social_twitter: str | None = None
    social_weibo: str | None = None
    custom_footer: str | None = None
