"""Settings API routes."""
from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_admin_user, get_db
from app.models.user import User
from app.schemas.common import ApiResponse
from app.schemas.settings import SettingsUpdate
from app.services.settings_service import SettingsService

router = APIRouter(prefix="/settings", tags=["Settings"])


@router.get("/public")
async def get_public_settings(db: AsyncSession = Depends(get_db)):
    """Get public site settings."""
    service = SettingsService(db)
    data = await service.get_public()
    return ApiResponse(code=0, message="ok", data=data.model_dump())


@router.put("")
async def update_settings(
    body: SettingsUpdate,
    _admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Update site settings (admin only)."""
    service = SettingsService(db)
    setting = await service.update(body)
    return ApiResponse(code=0, message="ok", data=setting.model_dump())
