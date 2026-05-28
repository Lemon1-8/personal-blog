"""Articles API routes."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user, get_admin_user
from app.models.user import User
from app.schemas.article import (
    ArticleCreate,
    ArticleDetail,
    ArticleListItem,
    ArticleStatusUpdate,
    ArticleUpdate,
    FavoriteResponse,
    LikeResponse,
)
from app.schemas.common import ApiResponse, PaginatedData
from app.services.article_service import ArticleService
from app.core.pagination import paginate

router = APIRouter(prefix="/articles", tags=["Articles"])


@router.get("")
async def list_articles(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=50),
    category_slug: str | None = Query(None),
    tag_slug: str | None = Query(None),
    keyword: str | None = Query(None),
    sort: str = Query("created_at_desc"),
    status: str = Query("published"),
    is_pinned: bool | None = Query(None),
    current_user: User | None = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List articles with filtering and pagination."""
    service = ArticleService(db)
    current_user_id = str(current_user.id) if current_user else None

    # Non-admin users only see published
    if current_user and current_user.role == "admin":
        pass  # admin can pass status param
    else:
        status = "published"

    items, total = await service.list_articles(
        page=page,
        page_size=page_size,
        category_slug=category_slug,
        tag_slug=tag_slug,
        keyword=keyword,
        sort=sort,
        status=status,
        is_pinned=is_pinned,
        current_user_id=current_user_id,
    )
    return ApiResponse(
        code=0, message="ok",
        data=PaginatedData(
            items=[i.model_dump(mode="json") for i in items],
            **paginate(total, page, page_size),
        ).model_dump(),
    )


@router.get("/favorites")
async def list_favorites(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current user's favorite articles."""
    if not current_user:
        raise HTTPException(
            status_code=401,
            detail={"code": 40100, "message": "未认证", "data": None},
        )
    service = ArticleService(db)
    items, total = await service.get_favorites(
        user_id=str(current_user.id), page=page, page_size=page_size
    )
    return ApiResponse(
        code=0, message="ok",
        data=PaginatedData(
            items=[i.model_dump(mode="json") for i in items],
            **paginate(total, page, page_size),
        ).model_dump(),
    )


@router.get("/{slug}")
async def get_article(
    slug: str,
    current_user: User | None = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get article detail by slug."""
    service = ArticleService(db)
    current_user_id = str(current_user.id) if current_user else None
    article = await service.get_by_slug(slug, current_user_id)

    if not article:
        raise HTTPException(
            status_code=404,
            detail={"code": 40400, "message": "文章不存在", "data": None},
        )

    # Increment views
    await service.increment_views(article.id)

    return ApiResponse(
        code=0, message="ok",
        data=article.model_dump(mode="json"),
    )


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_article(
    body: ArticleCreate,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Create article (admin only)."""
    try:
        service = ArticleService(db)
        article = await service.create(author_id=str(admin.id), data=body)
        return ApiResponse(
            code=0, message="文章创建成功",
            data={"id": str(article.id), "slug": article.slug},
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"code": 40901, "message": str(e), "data": None},
        )


@router.put("/{article_id}")
async def update_article(
    article_id: str,
    body: ArticleUpdate,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Update article (admin only)."""
    try:
        service = ArticleService(db)
        article = await service.update(article_id, data=body)
        return ApiResponse(
            code=0, message="文章更新成功",
            data={"id": str(article.id)},
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"code": 40901, "message": str(e), "data": None},
        )


@router.delete("/{article_id}")
async def delete_article(
    article_id: str,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete article (admin only)."""
    try:
        service = ArticleService(db)
        await service.delete(article_id)
        return ApiResponse(code=0, message="文章已删除", data=None)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": 40400, "message": str(e), "data": None},
        )


@router.patch("/{article_id}/status")
async def update_article_status(
    article_id: str,
    body: ArticleStatusUpdate,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Toggle article publish status (admin only)."""
    try:
        service = ArticleService(db)
        article = await service.update_status(article_id, body.status)
        return ApiResponse(
            code=0, message="状态已更新",
            data={"status": article.status},
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": 40400, "message": str(e), "data": None},
        )


@router.post("/{article_id}/like")
async def toggle_like(
    article_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Toggle like on an article."""
    if not current_user:
        raise HTTPException(
            status_code=401,
            detail={"code": 40100, "message": "未认证", "data": None},
        )
    try:
        service = ArticleService(db)
        is_liked, likes_count = await service.toggle_like(
            user_id=str(current_user.id), article_id=article_id
        )
        return ApiResponse(
            code=0, message="ok",
            data=LikeResponse(is_liked=is_liked, likes_count=likes_count).model_dump(),
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": 40400, "message": str(e), "data": None},
        )


@router.post("/{article_id}/favorite")
async def toggle_favorite(
    article_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Toggle favorite on an article."""
    if not current_user:
        raise HTTPException(
            status_code=401,
            detail={"code": 40100, "message": "未认证", "data": None},
        )
    try:
        service = ArticleService(db)
        is_fav, fav_count = await service.toggle_favorite(
            user_id=str(current_user.id), article_id=article_id
        )
        return ApiResponse(
            code=0, message="ok",
            data=FavoriteResponse(is_favorited=is_fav, favorites_count=fav_count).model_dump(),
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": 40400, "message": str(e), "data": None},
        )
