"""Tags API routes."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_admin_user, get_db
from app.models.user import User
from app.schemas.common import ApiResponse
from app.schemas.tag import TagCreate, TagOut, TagUpdate
from app.services.tag_service import TagService

router = APIRouter(prefix="/tags", tags=["Tags"])


@router.get("")
async def list_tags(db: AsyncSession = Depends(get_db)):
    """List all tags with article counts."""
    service = TagService(db)
    tags = await service.get_all()
    return ApiResponse(code=0, message="ok", data=[t.model_dump(mode="json") for t in tags])


@router.get("/hot")
async def hot_tags(
    limit: int = Query(10, ge=1, le=30),
    db: AsyncSession = Depends(get_db),
):
    """Get hottest tags."""
    service = TagService(db)
    tags = await service.get_hot(limit=limit)
    return ApiResponse(code=0, message="ok", data=[t.model_dump(mode="json") for t in tags])


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_tag(
    body: TagCreate,
    _admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Create tag (admin only)."""
    try:
        service = TagService(db)
        slug = body.slug or service._slugify(body.name)
        tag = await service.create(name=body.name, slug=slug)
        return ApiResponse(code=0, message="ok", data=TagOut.model_validate(tag).model_dump(mode="json"))
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"code": 40900, "message": str(e), "data": None},
        )


@router.put("/{tag_id}")
async def update_tag(
    tag_id: str,
    body: TagUpdate,
    _admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Update tag (admin only)."""
    try:
        service = TagService(db)
        tag = await service.update(tag_id, **body.model_dump(exclude_none=True))
        return ApiResponse(code=0, message="ok", data=TagOut.model_validate(tag).model_dump(mode="json"))
    except ValueError as e:
        if "不存在" in str(e):
            raise HTTPException(status_code=404, detail={"code": 40400, "message": str(e), "data": None})
        raise HTTPException(status_code=409, detail={"code": 40900, "message": str(e), "data": None})


@router.delete("/{tag_id}")
async def delete_tag(
    tag_id: str,
    _admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete tag (admin only)."""
    try:
        service = TagService(db)
        await service.delete(tag_id)
        return ApiResponse(code=0, message="ok", data=None)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": 40400, "message": str(e), "data": None},
        )
