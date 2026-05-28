"""Models package - must import all models so Alembic can discover them."""
from app.models.base import Base
from app.models.user import User
from app.models.article import Article
from app.models.category import Category
from app.models.tag import Tag
from app.models.article_tag import ArticleTag
from app.models.favorite import Favorite
from app.models.like import Like
from app.models.media import Media
from app.models.site_setting import SiteSetting

__all__ = [
    "Base",
    "User",
    "Article",
    "Category",
    "Tag",
    "ArticleTag",
    "Favorite",
    "Like",
    "Media",
    "SiteSetting",
]
