"""Users API routes (admin)."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_admin_user
from app.models.user import User
from app.schemas.common import ApiResponse, PaginatedData, PaginationParams
from app.schemas.user import UserOut, UserUpdate
from app.services.user_service import UserService
from app.core.pagination import paginate

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("")
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=50),
    role: str | None = Query(None),
    _admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """List all users (admin only)."""
    service = UserService(db)
    users, total = await service.list_users(page=page, page_size=page_size, role=role)
    return ApiResponse(
        code=0, message="ok",
        data=PaginatedData(
            items=[u.model_dump(mode="json") for u in users],
            **paginate(total, page, page_size),
        ).model_dump(),
    )


@router.get("/{user_id}")
async def get_user(
    user_id: str,
    _admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Get user details (admin only)."""
    service = UserService(db)
    user = await service.get_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail={"code": 40400, "message": "用户不存在", "data": None},
        )
    return ApiResponse(
        code=0, message="ok",
        data=UserOut.model_validate(user).model_dump(mode="json"),
    )


@router.put("/{user_id}")
async def update_user(
    user_id: str,
    body: UserUpdate,
    _admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Update user (admin only)."""
    try:
        service = UserService(db)
        user = await service.update(user_id, body)
        return ApiResponse(
            code=0, message="ok",
            data=UserOut.model_validate(user).model_dump(mode="json"),
        )
    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail={"code": 40400, "message": str(e), "data": None},
        )


@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    _admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete user (admin only)."""
    try:
        service = UserService(db)
        await service.delete(user_id)
        return ApiResponse(code=0, message="用户已删除", data=None)
    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail={"code": 40400, "message": str(e), "data": None},
        )
