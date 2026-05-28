"""Site settings service."""
from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.site_setting import SiteSetting
from app.schemas.settings import PublicSettingsOut


class SettingsService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_public(self) -> PublicSettingsOut:
        """Get public site settings."""
        result = await self.db.execute(select(SiteSetting).limit(1))
        setting = result.scalar_one_or_none()

        if not setting:
            return PublicSettingsOut()

        return PublicSettingsOut(
            site_name=setting.site_name,
            site_description=setting.site_description,
            site_logo=setting.site_logo,
            favicon=setting.favicon,
            social_links={
                k: v
                for k, v in {
                    "github": setting.social_github,
                    "twitter": setting.social_twitter,
                    "weibo": setting.social_weibo,
                }.items()
                if v
            },
        )

    async def update(self, data) -> SiteSetting:
        """Update site settings."""
        result = await self.db.execute(select(SiteSetting).limit(1))
        setting = result.scalar_one_or_none()

        if not setting:
            setting = SiteSetting()
            self.db.add(setting)

        update_data = data.model_dump(exclude_none=True)
        for key, value in update_data.items():
            if hasattr(setting, key):
                setattr(setting, key, value)

        await self.db.commit()
        await self.db.refresh(setting)
        return setting
