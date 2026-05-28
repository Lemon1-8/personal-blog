"""Tag service."""
from __future__ import annotations

import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.article import Article
from app.models.article_tag import ArticleTag
from app.models.tag import Tag
from app.schemas.tag import TagOut


class TagService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self) -> list[TagOut]:
        """Get all tags with article counts."""
        count_stmt = (
            select(
                ArticleTag.tag_id,
                func.count(ArticleTag.article_id).label("cnt"),
            )
            .group_by(ArticleTag.tag_id)
            .subquery()
        )
        stmt = (
            select(
                Tag.id,
                Tag.name,
                Tag.slug,
                Tag.created_at,
                func.coalesce(count_stmt.c.cnt, 0).label("article_count"),
            )
            .outerjoin(count_stmt, Tag.id == count_stmt.c.tag_id)
            .order_by(Tag.name)
        )
        result = await self.db.execute(stmt)
        rows = result.all()
        return [
            TagOut(
                id=str(r.id),
                name=r.name,
                slug=r.slug,
                article_count=r.article_count,
                created_at=r.created_at,
            )
            for r in rows
        ]

    async def get_hot(self, limit: int = 10) -> list[TagOut]:
        """Get hottest tags by article count."""
        count_stmt = (
            select(
                ArticleTag.tag_id,
                func.count(ArticleTag.article_id).label("cnt"),
            )
            .group_by(ArticleTag.tag_id)
            .subquery()
        )
        stmt = (
            select(
                Tag.id,
                Tag.name,
                Tag.slug,
                Tag.created_at,
                func.coalesce(count_stmt.c.cnt, 0).label("article_count"),
            )
            .outerjoin(count_stmt, Tag.id == count_stmt.c.tag_id)
            .order_by(func.coalesce(count_stmt.c.cnt, 0).desc())
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        rows = result.all()
        return [
            TagOut(
                id=str(r.id),
                name=r.name,
                slug=r.slug,
                article_count=r.article_count,
                created_at=r.created_at,
            )
            for r in rows
        ]

    async def get_by_slug(self, slug: str) -> Tag | None:
        result = await self.db.execute(select(Tag).where(Tag.slug == slug))
        return result.scalar_one_or_none()

    async def get_by_id(self, tag_id: str) -> Tag | None:
        result = await self.db.execute(
            select(Tag).where(Tag.id == uuid.UUID(tag_id))
        )
        return result.scalar_one_or_none()

    async def create(self, name: str, slug: str) -> Tag:
        existing = await self.db.execute(
            select(Tag).where((Tag.name == name) | (Tag.slug == slug))
        )
        if existing.scalar_one_or_none():
            raise ValueError("标签名称或 Slug 已存在")

        tag = Tag(name=name, slug=slug)
        self.db.add(tag)
        await self.db.commit()
        await self.db.refresh(tag)
        return tag

    async def update(self, tag_id: str, **kwargs) -> Tag:
        tag = await self.get_by_id(tag_id)
        if not tag:
            raise ValueError("标签不存在")

        if "name" in kwargs and kwargs["name"] and kwargs["name"] != tag.name:
            result = await self.db.execute(
                select(Tag).where(Tag.name == kwargs["name"])
            )
            if result.scalar_one_or_none():
                raise ValueError("标签名称已存在")
        if "slug" in kwargs and kwargs["slug"] and kwargs["slug"] != tag.slug:
            result = await self.db.execute(
                select(Tag).where(Tag.slug == kwargs["slug"])
            )
            if result.scalar_one_or_none():
                raise ValueError("标签 Slug 已存在")

        for key, value in kwargs.items():
            if value is not None and hasattr(tag, key):
                setattr(tag, key, value)
        await self.db.commit()
        await self.db.refresh(tag)
        return tag

    async def delete(self, tag_id: str) -> None:
        tag = await self.get_by_id(tag_id)
        if not tag:
            raise ValueError("标签不存在")
        await self.db.delete(tag)
        await self.db.commit()

    def _slugify(self, name: str) -> str:
        import re
        s = name.lower().strip()
        s = re.sub(r"[^\w\s-]", "", s)
        s = re.sub(r"[\s_]+", "-", s)
        s = re.sub(r"-+", "-", s)
        return s
