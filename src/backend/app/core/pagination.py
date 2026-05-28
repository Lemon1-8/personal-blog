"""Pagination utilities."""
from __future__ import annotations

import math


def paginate(total: int, page: int, page_size: int) -> dict:
    """Build a pagination info dict."""
    total_pages = max(1, math.ceil(total / page_size))
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }
