"""Auth API routes."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_required_user
from app.models.user import User
from app.schemas.auth import (
    AuthResponse,
    LoginRequest,
    LogoutRequest,
    PasswordChange,
    ProfileUpdate,
    RefreshTokenRequest,
    RegisterRequest,
    TokenResponse,
    UserInfo,
)
from app.schemas.common import ApiResponse
from app.schemas.user import UserOut
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """User registration."""
    try:
        service = AuthService(db)
        nickname = body.nickname or body.username
        result = await service.register(
            username=body.username,
            email=body.email,
            password=body.password,
            nickname=nickname,
        )
        return ApiResponse(code=0, message="注册成功", data=result.model_dump(mode="json"))
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"code": 40900, "message": str(e), "data": None},
        )


@router.post("/login")
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    """User login."""
    try:
        service = AuthService(db)
        result = await service.login(username=body.username, password=body.password)
        return ApiResponse(code=0, message="登录成功", data=result.model_dump(mode="json"))
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": 40100, "message": str(e), "data": None},
        )


@router.post("/refresh")
async def refresh_token(body: RefreshTokenRequest):
    """Refresh access token."""
    try:
        result = AuthService.refresh_tokens(body.refresh_token)
        return ApiResponse(code=0, message="ok", data=result)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": 40101, "message": str(e), "data": None},
        )


@router.post("/logout")
async def logout(
    body: LogoutRequest | None = None,
    current_user: User = Depends(get_required_user),
):
    """Logout (client-side token discard)."""
    return ApiResponse(code=0, message="已退出登录", data=None)


@router.get("/me")
async def get_me(current_user: User = Depends(get_required_user)):
    """Get current user profile."""
    user = UserOut.model_validate(current_user)
    return ApiResponse(code=0, message="ok", data=user.model_dump(mode="json"))


@router.put("/profile")
async def update_profile(
    body: ProfileUpdate,
    current_user: User = Depends(get_required_user),
    db: AsyncSession = Depends(get_db),
):
    """Update current user's profile."""
    try:
        service = AuthService(db)
        user = await service.update_profile(
            user_id=str(current_user.id),
            nickname=body.nickname,
            bio=body.bio,
            avatar=body.avatar,
        )
        return ApiResponse(
            code=0, message="ok",
            data=UserOut.model_validate(user).model_dump(mode="json"),
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": 40400, "message": str(e), "data": None},
        )


@router.put("/password")
async def change_password(
    body: PasswordChange,
    current_user: User = Depends(get_required_user),
    db: AsyncSession = Depends(get_db),
):
    """Change current user's password."""
    try:
        service = AuthService(db)
        await service.change_password(
            user_id=str(current_user.id),
            old_password=body.old_password,
            new_password=body.new_password,
        )
        return ApiResponse(code=0, message="密码修改成功", data=None)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": 40000, "message": str(e), "data": None},
        )
