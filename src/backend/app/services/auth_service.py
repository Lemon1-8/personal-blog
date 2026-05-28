"""Auth service: register, login, token management."""
from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.models.user import User
from app.schemas.auth import AuthResponse, UserInfo


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def register(
        self, username: str, email: str, password: str, nickname: str | None = None
    ) -> AuthResponse:
        """Register a new user."""
        # Check existing
        existing = await self.db.execute(
            select(User).where((User.username == username) | (User.email == email))
        )
        if existing.scalar_one_or_none():
            raise ValueError("用户名或邮箱已存在")

        user = User(
            username=username,
            email=email,
            hashed_password=hash_password(password),
            nickname=nickname or username,
        )
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)

        access_token = create_access_token(str(user.id))
        refresh_token = create_refresh_token(str(user.id))

        return AuthResponse(
            user=UserInfo(
                id=str(user.id),
                username=user.username,
                email=user.email,
                nickname=user.nickname,
                role=user.role,
                avatar=user.avatar,
                created_at=user.created_at,
            ),
            access_token=access_token,
            refresh_token=refresh_token,
        )

    async def login(self, username: str, password: str) -> AuthResponse:
        """Authenticate a user."""
        result = await self.db.execute(
            select(User).where(
                (User.username == username) | (User.email == username)
            )
        )
        user = result.scalar_one_or_none()
        if not user or not verify_password(password, user.hashed_password):
            raise ValueError("用户名或密码错误")

        if not user.is_active:
            raise ValueError("账户已被禁用")

        access_token = create_access_token(str(user.id))
        refresh_token = create_refresh_token(str(user.id))

        return AuthResponse(
            user=UserInfo(
                id=str(user.id),
                username=user.username,
                email=user.email,
                nickname=user.nickname,
                role=user.role,
                avatar=user.avatar,
                created_at=user.created_at,
            ),
            access_token=access_token,
            refresh_token=refresh_token,
        )

    @staticmethod
    def refresh_tokens(refresh_token: str) -> dict:
        """Refresh access token using a valid refresh token."""
        try:
            payload = decode_token(refresh_token)
            if payload.get("type") != "refresh":
                raise ValueError("Token 无效")
            user_id = payload["sub"]
            new_access = create_access_token(user_id)
            new_refresh = create_refresh_token(user_id)
            return {"access_token": new_access, "refresh_token": new_refresh}
        except Exception:
            raise ValueError("Token 已过期或无效")

    async def get_user_by_id(self, user_id: str) -> User | None:
        result = await self.db.execute(select(User).where(User.id == uuid.UUID(user_id)))
        return result.scalar_one_or_none()

    async def update_profile(
        self, user_id: str, nickname: str | None = None, bio: str | None = None,
        avatar: str | None = None,
    ) -> User:
        user = await self.get_user_by_id(user_id)
        if not user:
            raise ValueError("用户不存在")
        if nickname is not None:
            user.nickname = nickname
        if bio is not None:
            user.bio = bio
        if avatar is not None:
            user.avatar = avatar
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def change_password(
        self, user_id: str, old_password: str, new_password: str
    ) -> None:
        user = await self.get_user_by_id(user_id)
        if not user:
            raise ValueError("用户不存在")
        if not verify_password(old_password, user.hashed_password):
            raise ValueError("原密码错误")
        user.hashed_password = hash_password(new_password)
        await self.db.commit()
