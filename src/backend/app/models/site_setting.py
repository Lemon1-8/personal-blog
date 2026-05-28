"""Site settings model."""
from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, UUID


class SiteSetting(Base):
    __tablename__ = "site_settings"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID, primary_key=True, default=uuid.uuid4
    )
    site_name: Mapped[str] = mapped_column(
        String(100), nullable=False, default="My Blog"
    )
    site_description: Mapped[str] = mapped_column(
        String(300), nullable=False, default=""
    )
    site_logo: Mapped[str | None] = mapped_column(String(512), nullable=True)
    favicon: Mapped[str | None] = mapped_column(String(512), nullable=True)
    social_github: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    social_twitter: Mapped[str] = mapped_column(
        String(255), nullable=False, default=""
    )
    social_weibo: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    custom_footer: Mapped[str] = mapped_column(Text, nullable=False, default="")
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
