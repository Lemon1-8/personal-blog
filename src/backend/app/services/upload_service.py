"""Upload / media service."""
from __future__ import annotations

import io
import os
import uuid
from pathlib import Path

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.media import Media
from app.schemas.media import MediaOut, MediaUploaded
from app.utils.image import generate_large, generate_thumbnail, get_image_dimensions


class UploadService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def upload_image(
        self,
        file_content: bytes,
        filename: str,
        mime_type: str,
        uploader_id: str,
        upload_type: str = "content",
    ) -> MediaUploaded:
        """Upload a single image, generate thumbnail and large versions."""
        ext = Path(filename).suffix.lower()
        stored_name = f"{uuid.uuid4().hex}{ext}"

        # Get image dimensions
        width, height = get_image_dimensions(file_content)

        # Generate thumbnail and large
        thumb_bytes = generate_thumbnail(file_content)
        large_bytes = generate_large(file_content)

        if settings.UPLOAD_MODE == "s3":
            urls = await self._upload_to_s3(
                stored_name, file_content, thumb_bytes, large_bytes, mime_type
            )
        else:
            urls = self._save_local(
                stored_name, file_content, thumb_bytes, large_bytes
            )

        media = Media(
            filename=filename,
            stored_filename=stored_name,
            url=urls["url"],
            thumbnail_url=urls.get("thumbnail_url"),
            large_url=urls.get("large_url"),
            size=len(file_content),
            width=width,
            height=height,
            mime_type=mime_type,
            upload_type=upload_type,
            uploader_id=uuid.UUID(uploader_id),
        )
        self.db.add(media)
        await self.db.commit()
        await self.db.refresh(media)

        return MediaUploaded(
            id=str(media.id),
            url=media.url,
            thumbnail_url=media.thumbnail_url,
            large_url=media.large_url,
            filename=media.filename,
            size=media.size,
            width=media.width,
            height=media.height,
            mime_type=media.mime_type,
            created_at=media.created_at,
        )

    def _save_local(
        self,
        stored_name: str,
        content: bytes,
        thumb: bytes,
        large: bytes,
    ) -> dict:
        """Save files locally."""
        upload_dir = Path(settings.UPLOAD_DIR)
        # Year/month subdirectory
        from datetime import datetime
        now = datetime.now()
        subdir = f"{now.year}/{now.month:02d}"
        dest_dir = upload_dir / subdir
        dest_dir.mkdir(parents=True, exist_ok=True)

        # Save original
        orig_path = dest_dir / stored_name
        orig_path.write_bytes(content)

        # Save thumbnail
        thumb_name = f"thumb_{stored_name}"
        (dest_dir / thumb_name).write_bytes(thumb)

        # Save large
        large_name = f"large_{stored_name}"
        (dest_dir / large_name).write_bytes(large)

        base_url = f"{settings.MINIO_PUBLIC_URL}/uploads/{subdir}"
        return {
            "url": f"{base_url}/{stored_name}",
            "thumbnail_url": f"{base_url}/{thumb_name}",
            "large_url": f"{base_url}/{large_name}",
        }

    async def _upload_to_s3(
        self,
        stored_name: str,
        content: bytes,
        thumb: bytes,
        large: bytes,
        mime_type: str,
    ) -> dict:
        """Upload to MinIO/S3 compatible storage."""
        import boto3
        from botocore.config import Config

        s3 = boto3.client(
            "s3",
            endpoint_url=f"http://{settings.MINIO_ENDPOINT}",
            aws_access_key_id=settings.MINIO_ACCESS_KEY,
            aws_secret_access_key=settings.MINIO_SECRET_KEY,
            config=Config(signature_version="s3v4"),
            region_name="us-east-1",
        )

        bucket = settings.MINIO_BUCKET_NAME
        # Ensure bucket exists
        try:
            s3.head_bucket(Bucket=bucket)
        except Exception:
            s3.create_bucket(Bucket=bucket)

        from datetime import datetime
        now = datetime.now()
        subdir = f"{now.year}/{now.month:02d}"

        # Upload original
        key = f"{subdir}/{stored_name}"
        s3.put_object(Bucket=bucket, Key=key, Body=content, ContentType=mime_type)

        # Thumbnail
        thumb_key = f"{subdir}/thumb_{stored_name}"
        s3.put_object(Bucket=bucket, Key=thumb_key, Body=thumb, ContentType=mime_type)

        # Large
        large_key = f"{subdir}/large_{stored_name}"
        s3.put_object(Bucket=bucket, Key=large_key, Body=large, ContentType=mime_type)

        public_url = settings.MINIO_PUBLIC_URL.rstrip("/")
        return {
            "url": f"{public_url}/{bucket}/{key}",
            "thumbnail_url": f"{public_url}/{bucket}/{thumb_key}",
            "large_url": f"{public_url}/{bucket}/{large_key}",
        }

    async def list_media(
        self,
        page: int = 1,
        page_size: int = 20,
        mime_type: str | None = None,
    ) -> tuple[list[MediaOut], int]:
        conditions = []
        if mime_type:
            conditions.append(Media.mime_type == mime_type)

        count_stmt = select(func.count(Media.id)).where(*conditions)
        total_result = await self.db.execute(count_stmt)
        total = total_result.scalar() or 0

        if total == 0:
            return [], 0

        stmt = (
            select(Media)
            .where(*conditions)
            .order_by(Media.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        result = await self.db.execute(stmt)
        medias = result.scalars().all()
        return [MediaOut.model_validate(m) for m in medias], total

    async def delete_media(self, media_id: str) -> None:
        result = await self.db.execute(
            select(Media).where(Media.id == uuid.UUID(media_id))
        )
        media = result.scalar_one_or_none()
        if not media:
            raise ValueError("媒体文件不存在")

        # Delete from storage
        if settings.UPLOAD_MODE == "s3":
            await self._delete_from_s3(media)
        else:
            self._delete_local(media)

        await self.db.delete(media)
        await self.db.commit()

    def _delete_local(self, media: Media) -> None:
        """Delete local files."""
        from pathlib import Path

        # Parse the URL to get the file path
        url_path = media.url.replace(f"{settings.MINIO_PUBLIC_URL}/uploads/", "")
        if url_path:
            file_path = Path(settings.UPLOAD_DIR) / url_path
            if file_path.exists():
                file_path.unlink()

        if media.thumbnail_url:
            thumb_path = media.thumbnail_url.replace(
                f"{settings.MINIO_PUBLIC_URL}/uploads/", ""
            )
            tp = Path(settings.UPLOAD_DIR) / thumb_path
            if tp.exists():
                tp.unlink()

        if media.large_url:
            large_path = media.large_url.replace(
                f"{settings.MINIO_PUBLIC_URL}/uploads/", ""
            )
            lp = Path(settings.UPLOAD_DIR) / large_path
            if lp.exists():
                lp.unlink()

    async def _delete_from_s3(self, media: Media) -> None:
        import boto3
        from botocore.config import Config

        s3 = boto3.client(
            "s3",
            endpoint_url=f"http://{settings.MINIO_ENDPOINT}",
            aws_access_key_id=settings.MINIO_ACCESS_KEY,
            aws_secret_access_key=settings.MINIO_SECRET_KEY,
            config=Config(signature_version="s3v4"),
            region_name="us-east-1",
        )

        bucket = settings.MINIO_BUCKET_NAME
        keys = []

        # Extract key from URL
        def url_to_key(url: str) -> str:
            prefix = f"{settings.MINIO_PUBLIC_URL}/{bucket}/"
            if url.startswith(prefix):
                return url[len(prefix):]
            return ""

        for url in [media.url, media.thumbnail_url, media.large_url]:
            if url:
                key = url_to_key(url)
                if key:
                    keys.append({"Key": key})

        if keys:
            s3.delete_objects(Bucket=bucket, Delete={"Objects": keys})

    @staticmethod
    def validate_image(filename: str, content_type: str, size: int) -> None:
        """Validate image file."""
        if size > settings.MAX_UPLOAD_SIZE:
            raise ValueError("文件过大")

        ext = Path(filename).suffix.lower()
        if ext not in settings.ALLOWED_EXTENSIONS:
            raise ValueError("不支持的文件格式")

        if content_type not in settings.ALLOWED_MIME_TYPES:
            raise ValueError("不支持的媒体类型")
