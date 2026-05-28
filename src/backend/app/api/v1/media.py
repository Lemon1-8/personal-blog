"""Media API routes."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_admin_user, get_db
from app.models.user import User
from app.schemas.common import ApiResponse, PaginatedData
from app.services.upload_service import UploadService
from app.core.pagination import paginate

router = APIRouter(prefix="/media", tags=["Media"])


@router.get("")
async def list_media(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=50),
    mime_type: str | None = Query(None),
    _admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """List media library (admin only)."""
    service = UploadService(db)
    items, total = await service.list_media(
        page=page, page_size=page_size, mime_type=mime_type
    )
    return ApiResponse(
        code=0, message="ok",
        data=PaginatedData(
            items=[i.model_dump(mode="json") for i in items],
            **paginate(total, page, page_size),
        ).model_dump(),
    )


@router.delete("/{media_id}")
async def delete_media(
    media_id: str,
    _admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete media (admin only)."""
    try:
        service = UploadService(db)
        await service.delete_media(media_id)
        return ApiResponse(code=0, message="ok", data=None)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": 40400, "message": str(e), "data": None},
        )
