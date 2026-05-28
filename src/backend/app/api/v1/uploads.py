"""Upload API routes."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_admin_user, get_db
from app.models.user import User
from app.schemas.common import ApiResponse
from app.services.upload_service import UploadService

router = APIRouter(tags=["Upload"])


@router.post("/upload/image", status_code=status.HTTP_201_CREATED)
async def upload_image(
    file: UploadFile = File(...),
    type: str = Form("content"),
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Upload a single image (admin only)."""
    content = await file.read()
    try:
        UploadService.validate_image(
            file.filename or "image.jpg",
            file.content_type or "image/jpeg",
            len(content),
        )
    except ValueError as e:
        if "过大" in str(e):
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail={"code": 41300, "message": str(e), "data": None},
            )
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail={"code": 41500, "message": str(e), "data": None},
        )

    service = UploadService(db)
    result = await service.upload_image(
        file_content=content,
        filename=file.filename or "image.jpg",
        mime_type=file.content_type or "image/jpeg",
        uploader_id=str(admin.id),
        upload_type=type,
    )
    return ApiResponse(code=0, message="上传成功", data=result.model_dump(mode="json"))


@router.post("/upload/images", status_code=status.HTTP_201_CREATED)
async def upload_images(
    files: list[UploadFile] = File(...),
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Upload multiple images (max 10, admin only)."""
    if len(files) > 10:
        raise HTTPException(
            status_code=400,
            detail={"code": 40000, "message": "最多上传 10 张图片", "data": None},
        )

    service = UploadService(db)
    results = []
    for file in files:
        content = await file.read()
        try:
            UploadService.validate_image(
                file.filename or "image.jpg",
                file.content_type or "image/jpeg",
                len(content),
            )
        except ValueError as e:
            continue

        result = await service.upload_image(
            file_content=content,
            filename=file.filename or "image.jpg",
            mime_type=file.content_type or "image/jpeg",
            uploader_id=str(admin.id),
        )
        results.append(result.model_dump(mode="json"))

    return ApiResponse(code=0, message="上传成功", data=results)
