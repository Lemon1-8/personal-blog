"""Image processing utilities."""
from __future__ import annotations

import io
from pathlib import Path

from PIL import Image


def generate_thumbnail(image_bytes: bytes, size: tuple[int, int] = (300, 0)) -> bytes:
    """Generate a thumbnail image, preserving aspect ratio."""
    img = Image.open(io.BytesIO(image_bytes))
    img = img.convert("RGB")
    if size[1] == 0:
        ratio = size[0] / img.width
        new_size = (size[0], int(img.height * ratio))
    else:
        new_size = size
    img.thumbnail(new_size, Image.Resampling.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=85)
    return buf.getvalue()


def generate_large(image_bytes: bytes, max_width: int = 1200) -> bytes:
    """Generate a large version of an image, preserving aspect ratio."""
    img = Image.open(io.BytesIO(image_bytes))
    img = img.convert("RGB")
    if img.width > max_width:
        ratio = max_width / img.width
        new_size = (max_width, int(img.height * ratio))
        img = img.resize(new_size, Image.Resampling.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=90)
    return buf.getvalue()


def get_image_dimensions(image_bytes: bytes) -> tuple[int, int]:
    """Get (width, height) of an image without decoding fully."""
    img = Image.open(io.BytesIO(image_bytes))
    return img.width, img.height
