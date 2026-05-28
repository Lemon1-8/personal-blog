"""Auth-related schemas."""
from __future__ import annotations

from datetime import datetime

from pydantic import EmailStr, Field
from app.schemas.base import BaseSchema


class RegisterRequest(BaseSchema):
    username: str = Field(..., min_length=3, max_length=32, pattern=r"^[a-zA-Z0-9_]+$")
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    nickname: str | None = Field(default=None, min_length=1, max_length=32)


class LoginRequest(BaseSchema):
    username: str = Field(..., min_length=1)  # username or email
    password: str = Field(..., min_length=1)


class RefreshTokenRequest(BaseSchema):
    refresh_token: str


class LogoutRequest(BaseSchema):
    refresh_token: str | None = None


class UserInfo(BaseSchema):
    id: str
    username: str
    email: str
    nickname: str
    role: str
    avatar: str | None = None
    created_at: datetime | None = None


class AuthResponse(BaseSchema):
    user: UserInfo
    access_token: str
    refresh_token: str


class TokenResponse(BaseSchema):
    access_token: str
    refresh_token: str


class ProfileUpdate(BaseSchema):
    nickname: str | None = Field(default=None, min_length=1, max_length=32)
    bio: str | None = Field(default=None, max_length=500)
    avatar: str | None = Field(default=None, max_length=512)


class PasswordChange(BaseSchema):
    old_password: str
    new_password: str = Field(..., min_length=8, max_length=128)
