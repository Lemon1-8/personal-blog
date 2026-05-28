"""FastAPI application entry point."""
from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1 import articles, auth, categories, media, settings, tags, uploads, users
from app.config import settings as app_settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan (startup/shutdown)."""
    # Startup: nothing special needed
    yield
    # Shutdown: cleanup if needed


app = FastAPI(
    title=app_settings.APP_NAME,
    version=app_settings.APP_VERSION,
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=app_settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Unified error handler ──
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"code": 50000, "message": "服务器内部错误", "data": None},
    )


# ── Health check ──
@app.get("/api/v1/health")
async def health_check():
    return {
        "code": 0,
        "message": "ok",
        "data": {"status": "healthy", "version": app_settings.APP_VERSION},
    }


# ── Mount routers ──
app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(articles.router, prefix="/api/v1")
app.include_router(categories.router, prefix="/api/v1")
app.include_router(tags.router, prefix="/api/v1")
app.include_router(uploads.router, prefix="/api/v1")
app.include_router(media.router, prefix="/api/v1")
app.include_router(settings.router, prefix="/api/v1")
