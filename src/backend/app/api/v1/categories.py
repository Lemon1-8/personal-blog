"""Categories API routes."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_admin_user, get_db
from app.models.user import User
from app.schemas.category import CategoryCreate, CategoryOut, CategoryUpdate
from app.schemas.common import ApiResponse
from app.services.category_service import CategoryService

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("")
async def list_categories(db: AsyncSession = Depends(get_db)):
    """List all categories with article counts."""
    service = CategoryService(db)
    cats = await service.get_all()
    return ApiResponse(code=0, message="ok", data=[c.model_dump(mode="json") for c in cats])


@router.get("/{slug}")
async def get_category(slug: str, db: AsyncSession = Depends(get_db)):
    """Get category by slug."""
    service = CategoryService(db)
    cat = await service.get_by_slug(slug)
    if not cat:
        raise HTTPException(
            status_code=404,
            detail={"code": 40400, "message": "分类不存在", "data": None},
        )
    # Get article count
    from sqlalchemy import func, select
    from app.models.article import Article
    count_result = await db.execute(
        select(func.count(Article.id)).where(
            Article.category_id == cat.id, Article.status == "published"
        )
    )
    article_count = count_result.scalar() or 0

    data = CategoryOut(
        id=str(cat.id),
        name=cat.name,
        slug=cat.slug,
        description=cat.description,
        article_count=article_count,
        order=cat.order,
        created_at=cat.created_at,
    )
    return ApiResponse(code=0, message="ok", data=data.model_dump(mode="json"))


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_category(
    body: CategoryCreate,
    _admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Create category (admin only)."""
    try:
        service = CategoryService(db)
        slug = body.slug or service._slugify(body.name)
        cat = await service.create(
            name=body.name, slug=slug,
            description=body.description or "", order=body.order,
        )
        return ApiResponse(code=0, message="ok", data=CategoryOut.model_validate(cat).model_dump(mode="json"))
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"code": 40900, "message": str(e), "data": None},
        )


@router.put("/{category_id}")
async def update_category(
    category_id: str,
    body: CategoryUpdate,
    _admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Update category (admin only)."""
    try:
        service = CategoryService(db)
        cat = await service.update(
            category_id,
            **body.model_dump(exclude_none=True),
        )
        return ApiResponse(code=0, message="ok", data=CategoryOut.model_validate(cat).model_dump(mode="json"))
    except ValueError as e:
        if "不存在" in str(e):
            raise HTTPException(status_code=404, detail={"code": 40400, "message": str(e), "data": None})
        raise HTTPException(status_code=409, detail={"code": 40900, "message": str(e), "data": None})


@router.delete("/{category_id}")
async def delete_category(
    category_id: str,
    _admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete category (admin only)."""
    try:
        service = CategoryService(db)
        await service.delete(category_id)
        return ApiResponse(code=0, message="ok", data=None)
    except ValueError as e:
        if "还有文章" in str(e):
            raise HTTPException(status_code=400, detail={"code": 40000, "message": str(e), "data": None})
        raise HTTPException(status_code=404, detail={"code": 40400, "message": str(e), "data": None})
