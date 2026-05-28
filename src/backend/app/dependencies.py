"""Dependency injection: DB session, current user, etc."""
from __future__ import annotations

import os
from collections.abc import AsyncGenerator

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.config import settings
from app.core.security import decode_token
from app.models.user import User

# Support test override via env - use lazy initialization
_db_url = os.environ.get(
    "DATABASE_URL_TEST",
    settings.DATABASE_URL,
)

# Only create the engine if not using SQLite (which may need specific handling)
# We use a function to allow tests to override
_engine = None
_async_session_factory = None

security_scheme = HTTPBearer(auto_error=False)


def _get_engine_and_factory():
    global _engine, _async_session_factory
    if _engine is None:
        _engine = create_async_engine(_db_url, echo=settings.DEBUG, pool_pre_ping=True)
        _async_session_factory = async_sessionmaker(_engine, expire_on_commit=False)
    return _async_session_factory


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Provide a transactional database session."""
    factory = _get_engine_and_factory()
    async with factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security_scheme),
    db: AsyncSession = Depends(get_db),
) -> User | None:
    """Get the current authenticated user (optional)."""
    if not credentials:
        return None
    try:
        payload = decode_token(credentials.credentials)
        if payload.get("type") != "access":
            return None
        user_id = payload.get("sub")
        if not user_id:
            return None
        result = await db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()
    except Exception:
        return None


async def get_required_user(
    current_user: User | None = Depends(get_current_user),
) -> User:
    """Get the current user, raise 401 if not authenticated."""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "code": 40100,
                "message": "未认证（缺少 Token）",
                "data": None,
            },
        )
    return current_user


async def get_admin_user(
    current_user: User = Depends(get_required_user),
) -> User:
    """Get the current user, ensure admin role."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": 40300,
                "message": "权限不足",
                "data": None,
            },
        )
    return current_user
