"""User service (admin)."""
from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.schemas.user import UserOut


class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_users(
        self, page: int = 1, page_size: int = 20, role: str | None = None
    ) -> tuple[list[UserOut], int]:
        conditions = []
        if role:
            conditions.append(User.role == role)

        from sqlalchemy import func

        count_stmt = select(func.count(User.id)).where(*conditions)
        total_result = await self.db.execute(count_stmt)
        total = total_result.scalar() or 0

        if total == 0:
            return [], 0

        stmt = (
            select(User)
            .where(*conditions)
            .order_by(User.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        result = await self.db.execute(stmt)
        users = result.scalars().all()
        return [UserOut.model_validate(u) for u in users], total

    async def get_by_id(self, user_id: str) -> User | None:
        result = await self.db.execute(
            select(User).where(User.id == uuid.UUID(user_id))
        )
        return result.scalar_one_or_none()

    async def update(self, user_id: str, data) -> User:
        user = await self.get_by_id(user_id)
        if not user:
            raise ValueError("用户不存在")

        update_data = data.model_dump(exclude_none=True)
        if "email" in update_data and update_data["email"] != user.email:
            result = await self.db.execute(
                select(User).where(User.email == update_data["email"])
            )
            if result.scalar_one_or_none():
                raise ValueError("邮箱已存在")

        for key, value in update_data.items():
            if hasattr(user, key):
                setattr(user, key, value)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def delete(self, user_id: str) -> None:
        user = await self.get_by_id(user_id)
        if not user:
            raise ValueError("用户不存在")
        await self.db.delete(user)
        await self.db.commit()
