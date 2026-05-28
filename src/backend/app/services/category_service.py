"""Category service."""
from __future__ import annotations

import uuid

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.article import Article
from app.models.category import Category
from app.schemas.category import CategoryOut


class CategoryService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self) -> list[CategoryOut]:
        """Get all categories with article counts."""
        # Subquery for article count per category
        count_stmt = (
            select(
                Article.category_id,
                func.count(Article.id).label("cnt"),
            )
            .where(Article.status == "published")
            .group_by(Article.category_id)
            .subquery()
        )

        stmt = (
            select(
                Category.id,
                Category.name,
                Category.slug,
                Category.description,
                Category.order,
                Category.created_at,
                func.coalesce(count_stmt.c.cnt, 0).label("article_count"),
            )
            .outerjoin(count_stmt, Category.id == count_stmt.c.category_id)
            .order_by(Category.order)
        )
        result = await self.db.execute(stmt)
        rows = result.all()
        return [
            CategoryOut(
                id=str(r.id),
                name=r.name,
                slug=r.slug,
                description=r.description,
                order=r.order,
                article_count=r.article_count,
                created_at=r.created_at,
            )
            for r in rows
        ]

    async def get_by_slug(self, slug: str) -> Category | None:
        result = await self.db.execute(
            select(Category).where(Category.slug == slug)
        )
        return result.scalar_one_or_none()

    async def get_by_id(self, category_id: str) -> Category | None:
        result = await self.db.execute(
            select(Category).where(Category.id == uuid.UUID(category_id))
        )
        return result.scalar_one_or_none()

    async def create(
        self, name: str, slug: str, description: str = "", order: int = 0
    ) -> Category:
        existing = await self.db.execute(
            select(Category).where(
                (Category.name == name) | (Category.slug == slug)
            )
        )
        if existing.scalar_one_or_none():
            raise ValueError("分类名称或 Slug 已存在")

        cat = Category(name=name, slug=slug, description=description, order=order)
        self.db.add(cat)
        await self.db.commit()
        await self.db.refresh(cat)
        return cat

    async def update(
        self, category_id: str, **kwargs
    ) -> Category:
        cat = await self.get_by_id(category_id)
        if not cat:
            raise ValueError("分类不存在")

        # Check uniqueness
        if "name" in kwargs and kwargs["name"] and kwargs["name"] != cat.name:
            result = await self.db.execute(
                select(Category).where(Category.name == kwargs["name"])
            )
            if result.scalar_one_or_none():
                raise ValueError("分类名称已存在")
        if "slug" in kwargs and kwargs["slug"] and kwargs["slug"] != cat.slug:
            result = await self.db.execute(
                select(Category).where(Category.slug == kwargs["slug"])
            )
            if result.scalar_one_or_none():
                raise ValueError("分类 Slug 已存在")

        for key, value in kwargs.items():
            if value is not None and hasattr(cat, key):
                setattr(cat, key, value)
        await self.db.commit()
        await self.db.refresh(cat)
        return cat

    async def delete(self, category_id: str) -> None:
        cat = await self.get_by_id(category_id)
        if not cat:
            raise ValueError("分类不存在")

        # Check if category has articles
        result = await self.db.execute(
            select(func.count(Article.id)).where(
                Article.category_id == uuid.UUID(category_id),
                Article.status == "published",
            )
        )
        count = result.scalar()
        if count and count > 0:
            raise ValueError("分类下还有文章，无法删除")

        await self.db.delete(cat)
        await self.db.commit()

    def _slugify(self, name: str) -> str:
        import re
        s = name.lower().strip()
        s = re.sub(r"[^\w\s-]", "", s)
        s = re.sub(r"[\s_]+", "-", s)
        s = re.sub(r"-+", "-", s)
        return s
