"""Article service."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import Text, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.article import Article
from app.models.article_tag import ArticleTag
from app.models.category import Category
from app.models.favorite import Favorite
from app.models.like import Like
from app.models.tag import Tag
from app.models.user import User
from app.schemas.article import (
    ArticleDetail,
    ArticleListItem,
    ArticleNav,
    AuthorBrief,
    CategoryBrief,
    TagBrief,
)


class ArticleService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_articles(
        self,
        page: int = 1,
        page_size: int = 20,
        category_slug: str | None = None,
        tag_slug: str | None = None,
        keyword: str | None = None,
        sort: str = "created_at_desc",
        status: str = "published",
        is_pinned: bool | None = None,
        current_user_id: str | None = None,
    ) -> tuple[list[ArticleListItem], int]:
        """Get paginated article list."""
        # Base query
        conditions = []

        if status == "published":
            conditions.append(Article.status == "published")
        elif current_user_id:
            # Admin can see drafts
            conditions.append(
                or_(
                    Article.status == "published",
                    Article.author_id == uuid.UUID(current_user_id),
                )
            )

        # Category filter
        if category_slug:
            cat_result = await self.db.execute(
                select(Category).where(Category.slug == category_slug)
            )
            cat = cat_result.scalar_one_or_none()
            if cat:
                conditions.append(Article.category_id == cat.id)
            else:
                return [], 0

        # Tag filter
        if tag_slug:
            tag_result = await self.db.execute(
                select(Tag).where(Tag.slug == tag_slug)
            )
            tag = tag_result.scalar_one_or_none()
            if tag:
                subq = select(ArticleTag.article_id).where(
                    ArticleTag.tag_id == tag.id
                )
                conditions.append(Article.id.in_(subq))
            else:
                return [], 0

        # Pinned filter
        if is_pinned is not None:
            conditions.append(Article.is_pinned == is_pinned)

        # Keyword search
        if keyword:
            kw = keyword.lower()
            conditions.append(
                or_(
                    func.lower(Article.title).contains(kw),
                    func.lower(Article.summary).contains(kw),
                    func.lower(Article.content).contains(kw),
                )
            )

        # Count
        count_stmt = select(func.count(Article.id)).where(*conditions)
        total_result = await self.db.execute(count_stmt)
        total = total_result.scalar() or 0

        if total == 0:
            return [], 0

        # Sort
        order_clauses = []
        if sort == "created_at_asc":
            order_clauses.append(Article.created_at.asc())
        elif sort == "views_desc":
            order_clauses.append(Article.views_count.desc())
            order_clauses.append(Article.created_at.desc())
        else:  # created_at_desc
            order_clauses.append(Article.is_pinned.desc().nullslast())
            order_clauses.append(Article.created_at.desc())

        # Query
        stmt = (
            select(Article)
            .where(*conditions)
            .order_by(*order_clauses)
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        result = await self.db.execute(stmt)
        articles = result.scalars().all()

        items = []
        for a in articles:
            items.append(self._to_list_item(a))

        return items, total

    async def get_by_slug(
        self, slug: str, current_user_id: str | None = None
    ) -> ArticleDetail | None:
        """Get article detail by slug."""
        result = await self.db.execute(
            select(Article).where(Article.slug == slug)
        )
        article = result.scalar_one_or_none()
        if not article:
            return None

        # Authorization check
        if article.status == "draft" and (
            not current_user_id
            or str(article.author_id) != current_user_id
        ):
            return None

        # Build response
        detail = ArticleDetail(
            id=str(article.id),
            title=article.title,
            slug=article.slug,
            summary=article.summary,
            content=article.content,
            content_type=article.content_type,
            cover_image=article.cover_image,
            category=CategoryBrief(
                id=str(article.category.id),
                name=article.category.name,
                slug=article.category.slug,
            ) if article.category else None,
            tags=[
                TagBrief(id=str(t.id), name=t.name, slug=t.slug)
                for t in article.tags
            ],
            author=AuthorBrief(
                id=str(article.author.id),
                nickname=article.author.nickname,
                avatar=article.author.avatar,
            ),
            views_count=article.views_count,
            likes_count=article.likes_count,
            favorites_count=article.favorites_count,
            comment_count=article.comment_count,
            is_pinned=article.is_pinned,
            published_at=article.published_at,
            created_at=article.created_at,
            updated_at=article.updated_at,
        )

        # Check if current user has liked/favorited
        if current_user_id:
            uid = uuid.UUID(current_user_id)
            lk = await self.db.execute(
                select(Like).where(
                    Like.user_id == uid, Like.article_id == article.id
                )
            )
            detail.is_liked = lk.scalar_one_or_none() is not None

            fv = await self.db.execute(
                select(Favorite).where(
                    Favorite.user_id == uid, Favorite.article_id == article.id
                )
            )
            detail.is_favorited = fv.scalar_one_or_none() is not None

        # Prev / Next
        detail.prev_article = await self._get_adjacent(article, "prev")
        detail.next_article = await self._get_adjacent(article, "next")

        return detail

    async def _get_adjacent(
        self, article: Article, direction: str
    ) -> dict | None:
        """Get previous or next published article."""
        published_at = article.published_at
        if published_at is None:
            return None

        if direction == "prev":
            stmt = (
                select(Article)
                .where(
                    Article.published_at < published_at,
                    Article.status == "published",
                )
                .order_by(Article.published_at.desc())
                .limit(1)
            )
        else:
            stmt = (
                select(Article)
                .where(
                    Article.published_at > published_at,
                    Article.status == "published",
                )
                .order_by(Article.published_at.asc())
                .limit(1)
            )
        result = await self.db.execute(stmt)
        adj = result.scalar_one_or_none()
        if adj:
            return {"id": str(adj.id), "title": adj.title, "slug": adj.slug}
        return None

    async def create(self, author_id: str, data) -> Article:
        """Create a new article."""
        slug = data.slug or self._slugify(data.title)

        # Check slug uniqueness
        existing = await self.db.execute(
            select(Article).where(Article.slug == slug)
        )
        if existing.scalar_one_or_none():
            raise ValueError("Slug 重复，请自定义")

        article = Article(
            title=data.title,
            slug=slug,
            summary=data.summary or "",
            content=data.content,
            content_type=data.content_type or "html",
            cover_image=data.cover_image,
            author_id=uuid.UUID(author_id),
            category_id=uuid.UUID(data.category_id) if data.category_id else None,
            status=data.status or "draft",
            is_pinned=data.is_pinned or False,
        )

        if data.status == "published":
            article.published_at = datetime.now(timezone.utc)

        self.db.add(article)
        await self.db.flush()

        # Handle tags
        if data.tag_ids:
            for tid in data.tag_ids:
                at = ArticleTag(article_id=article.id, tag_id=uuid.UUID(tid))
                self.db.add(at)

        await self.db.commit()
        await self.db.refresh(article)
        return article

    async def update(self, article_id: str, data) -> Article:
        """Update an article."""
        result = await self.db.execute(
            select(Article).where(Article.id == uuid.UUID(article_id))
        )
        article = result.scalar_one_or_none()
        if not article:
            raise ValueError("文章不存在")

        update_data = data.model_dump(exclude_none=True, exclude={"tag_ids"})
        for key, value in update_data.items():
            if hasattr(article, key):
                setattr(article, key, value)

        # Handle slug
        if data.slug and data.slug != article.slug:
            existing = await self.db.execute(
                select(Article).where(
                    Article.slug == data.slug, Article.id != article.id
                )
            )
            if existing.scalar_one_or_none():
                raise ValueError("Slug 重复")

        # Handle publish
        if data.status == "published" and article.published_at is None:
            article.published_at = datetime.now(timezone.utc)

        # Handle tags
        if data.tag_ids is not None:
            # Delete existing tags
            await self.db.execute(
                ArticleTag.__table__.delete().where(
                    ArticleTag.article_id == article.id
                )
            )
            for tid in data.tag_ids:
                at = ArticleTag(article_id=article.id, tag_id=uuid.UUID(tid))
                self.db.add(at)

        await self.db.commit()
        await self.db.refresh(article)
        return article

    async def delete(self, article_id: str) -> None:
        result = await self.db.execute(
            select(Article).where(Article.id == uuid.UUID(article_id))
        )
        article = result.scalar_one_or_none()
        if not article:
            raise ValueError("文章不存在")
        await self.db.delete(article)
        await self.db.commit()

    async def update_status(
        self, article_id: str, new_status: str
    ) -> Article:
        result = await self.db.execute(
            select(Article).where(Article.id == uuid.UUID(article_id))
        )
        article = result.scalar_one_or_none()
        if not article:
            raise ValueError("文章不存在")
        article.status = new_status
        if new_status == "published" and article.published_at is None:
            article.published_at = datetime.now(timezone.utc)
        await self.db.commit()
        await self.db.refresh(article)
        return article

    async def toggle_like(
        self, user_id: str, article_id: str
    ) -> tuple[bool, int]:
        """Toggle like status. Returns (is_liked, likes_count)."""
        uid = uuid.UUID(user_id)
        aid = uuid.UUID(article_id)

        result = await self.db.execute(
            select(Like).where(
                Like.user_id == uid, Like.article_id == aid
            )
        )
        like = result.scalar_one_or_none()

        article_result = await self.db.execute(
            select(Article).where(Article.id == aid)
        )
        article = article_result.scalar_one_or_none()
        if not article:
            raise ValueError("文章不存在")

        if like:
            await self.db.delete(like)
            article.likes_count = max(0, article.likes_count - 1)
            is_liked = False
        else:
            self.db.add(Like(user_id=uid, article_id=aid))
            article.likes_count += 1
            is_liked = True

        await self.db.commit()
        await self.db.refresh(article)
        return is_liked, article.likes_count

    async def toggle_favorite(
        self, user_id: str, article_id: str
    ) -> tuple[bool, int]:
        uid = uuid.UUID(user_id)
        aid = uuid.UUID(article_id)

        result = await self.db.execute(
            select(Favorite).where(
                Favorite.user_id == uid, Favorite.article_id == aid
            )
        )
        fav = result.scalar_one_or_none()

        article_result = await self.db.execute(
            select(Article).where(Article.id == aid)
        )
        article = article_result.scalar_one_or_none()
        if not article:
            raise ValueError("文章不存在")

        if fav:
            await self.db.delete(fav)
            article.favorites_count = max(0, article.favorites_count - 1)
            is_fav = False
        else:
            self.db.add(Favorite(user_id=uid, article_id=aid))
            article.favorites_count += 1
            is_fav = True

        await self.db.commit()
        await self.db.refresh(article)
        return is_fav, article.favorites_count

    async def get_favorites(
        self, user_id: str, page: int = 1, page_size: int = 20
    ) -> tuple[list[ArticleListItem], int]:
        uid = uuid.UUID(user_id)
        total_stmt = (
            select(func.count(Favorite.article_id))
            .where(Favorite.user_id == uid)
        )
        total_result = await self.db.execute(total_stmt)
        total = total_result.scalar() or 0

        if total == 0:
            return [], 0

        stmt = (
            select(Article)
            .join(Favorite, Article.id == Favorite.article_id)
            .where(Favorite.user_id == uid, Article.status == "published")
            .order_by(Favorite.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        result = await self.db.execute(stmt)
        articles = result.scalars().all()
        return [self._to_list_item(a) for a in articles], total

    async def increment_views(self, article_id: str) -> None:
        await self.db.execute(
            Article.__table__.update()
            .where(Article.id == uuid.UUID(article_id))
            .values(views_count=Article.views_count + 1)
        )
        await self.db.commit()

    def _to_list_item(self, article: Article) -> ArticleListItem:
        return ArticleListItem(
            id=str(article.id),
            title=article.title,
            slug=article.slug,
            summary=article.summary,
            cover_image=article.cover_image,
            category=CategoryBrief(
                id=str(article.category.id),
                name=article.category.name,
                slug=article.category.slug,
            ) if article.category else None,
            tags=[
                TagBrief(id=str(t.id), name=t.name, slug=t.slug)
                for t in article.tags
            ],
            author=AuthorBrief(
                id=str(article.author.id),
                nickname=article.author.nickname,
                avatar=article.author.avatar,
            ),
            views_count=article.views_count,
            likes_count=article.likes_count,
            comment_count=article.comment_count,
            is_pinned=article.is_pinned,
            published_at=article.published_at,
            created_at=article.created_at,
        )

    @staticmethod
    def _slugify(title: str) -> str:
        import re
        s = title.lower().strip()
        s = re.sub(r"[^\w\s-]", "", s)
        s = re.sub(r"[\s_]+", "-", s)
        s = re.sub(r"-+", "-", s)
        return s[:200]
