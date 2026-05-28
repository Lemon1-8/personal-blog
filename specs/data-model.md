# 数据模型定义

> 版本: v1.0
> 最后更新: 2026-05-28
> 数据库: PostgreSQL 16
> ORM: SQLAlchemy 2.0 (async)

---

## 1. ER 图概览

```
User 1──N Article N──1 Category
                  │
                  N────N Tag
                  │
                  1──N Media
```

- User 与 Article：一对多（一个作者多篇文章）
- Article 与 Category：多对一（一篇文章一个分类，一个分类多篇文章）
- Article 与 Tag：多对多（通过 article_tags 关联表）
- Article 与 Media：引用关系（文章通过图片 URL 引用媒体；Media 记录自身的 metadata）
- User 与 Favorite/Article：用户收藏文章（多对多，通过 favorites 关联表）
- User 与 Like/Article：用户点赞文章（多对多，通过 likes 关联表）

---

## 2. 表定义

### 2.1 users（用户表）

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK, default uuid4 | 主键 |
| username | VARCHAR(32) | NOT NULL, UNIQUE, INDEX | 用户名 |
| email | VARCHAR(255) | NOT NULL, UNIQUE, INDEX | 邮箱 |
| hashed_password | VARCHAR(255) | NOT NULL | bcrypt 哈希密码 |
| nickname | VARCHAR(32) | NOT NULL, DEFAULT '' | 昵称 |
| avatar | VARCHAR(512) | DEFAULT NULL | 头像 URL |
| bio | VARCHAR(500) | DEFAULT '' | 个人简介 |
| role | VARCHAR(16) | NOT NULL, DEFAULT 'user' | 角色: `user` / `admin` |
| is_active | BOOLEAN | NOT NULL, DEFAULT TRUE | 是否激活 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW(), ON UPDATE NOW() | 更新时间 |

**Indexes:**
- `idx_users_username` ON (username)
- `idx_users_email` ON (email)
- `idx_users_role` ON (role)

**SQLAlchemy Model:**
```python
class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username: Mapped[str] = mapped_column(String(32), unique=True, nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    nickname: Mapped[str] = mapped_column(String(32), nullable=False, default="")
    avatar: Mapped[Optional[str]] = mapped_column(String(512), nullable=True, default=None)
    bio: Mapped[str] = mapped_column(String(500), nullable=False, default="")
    role: Mapped[str] = mapped_column(String(16), nullable=False, default="user")
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # 关系
    articles: Mapped[list["Article"]] = relationship(back_populates="author", lazy="selectin")
    favorites: Mapped[list["Article"]] = relationship(
        secondary="favorites", back_populates="favorited_by", lazy="selectin"
    )
    likes: Mapped[list["Article"]] = relationship(
        secondary="likes", back_populates="liked_by", lazy="selectin"
    )
```

---

### 2.2 categories（分类表）

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK, default uuid4 | 主键 |
| name | VARCHAR(32) | NOT NULL, UNIQUE | 分类名称 |
| slug | VARCHAR(64) | NOT NULL, UNIQUE, INDEX | URL 友好的标识 |
| description | VARCHAR(200) | DEFAULT '' | 分类描述 |
| order | INT | NOT NULL, DEFAULT 0 | 排序权重（升序） |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**SQLAlchemy Model:**
```python
class Category(Base):
    __tablename__ = "categories"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    description: Mapped[str] = mapped_column(String(200), nullable=False, default="")
    order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    articles: Mapped[list["Article"]] = relationship(back_populates="category", lazy="selectin")
```

---

### 2.3 tags（标签表）

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK, default uuid4 | 主键 |
| name | VARCHAR(32) | NOT NULL, UNIQUE | 标签名称 |
| slug | VARCHAR(64) | NOT NULL, UNIQUE, INDEX | URL 标识 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**SQLAlchemy Model:**
```python
class Tag(Base):
    __tablename__ = "tags"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
```

---

### 2.4 articles（文章表）

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK, default uuid4 | 主键 |
| title | VARCHAR(200) | NOT NULL | 文章标题 |
| slug | VARCHAR(255) | NOT NULL, UNIQUE, INDEX | URL 标识 |
| summary | VARCHAR(500) | DEFAULT '' | 摘要 |
| content | TEXT | NOT NULL | 富文本内容（HTML） |
| content_type | VARCHAR(16) | NOT NULL, DEFAULT 'html' | 内容格式: `html` / `markdown` |
| cover_image | VARCHAR(512) | DEFAULT NULL | 封面图 URL |
| author_id | UUID | FK → users.id, NOT NULL | 作者 ID |
| category_id | UUID | FK → categories.id, DEFAULT NULL | 分类 ID |
| status | VARCHAR(16) | NOT NULL, DEFAULT 'draft' | 状态: `draft` / `published` |
| is_pinned | BOOLEAN | NOT NULL, DEFAULT FALSE | 是否置顶 |
| views_count | INT | NOT NULL, DEFAULT 0 | 浏览量 |
| likes_count | INT | NOT NULL, DEFAULT 0 | 点赞数（冗余） |
| favorites_count | INT | NOT NULL, DEFAULT 0 | 收藏数（冗余） |
| comment_count | INT | NOT NULL, DEFAULT 0 | 评论数（预留） |
| published_at | TIMESTAMPTZ | DEFAULT NULL | 发布时间 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `idx_articles_slug` ON (slug) UNIQUE
- `idx_articles_author_id` ON (author_id)
- `idx_articles_category_id` ON (category_id)
- `idx_articles_status_published_at` ON (status, published_at DESC)
- `idx_articles_is_pinned` ON (is_pinned DESC)
- `idx_articles_views_count` ON (views_count DESC)
- `idx_articles_title_search` — GIN trigram index for full-text search

**SQLAlchemy Model:**
```python
class Article(Base):
    __tablename__ = "articles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    summary: Mapped[str] = mapped_column(String(500), nullable=False, default="")
    content: Mapped[str] = mapped_column(Text, nullable=False)
    content_type: Mapped[str] = mapped_column(String(16), nullable=False, default="html")
    cover_image: Mapped[Optional[str]] = mapped_column(String(512), nullable=True, default=None)
    author_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    category_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("categories.id"), nullable=True)
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="draft")
    is_pinned: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    views_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    likes_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    favorites_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    comment_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # 关系
    author: Mapped["User"] = relationship(back_populates="articles", lazy="selectin")
    category: Mapped[Optional["Category"]] = relationship(back_populates="articles", lazy="selectin")
    tags: Mapped[list["Tag"]] = relationship(
        secondary="article_tags", back_populates="articles", lazy="selectin"
    )
    favorited_by: Mapped[list["User"]] = relationship(
        secondary="favorites", back_populates="favorites", lazy="selectin"
    )
    liked_by: Mapped[list["User"]] = relationship(
        secondary="likes", back_populates="likes", lazy="selectin"
    )
```

---

### 2.5 article_tags（文章-标签关联表）

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| article_id | UUID | PK, FK → articles.id | 文章 ID |
| tag_id | UUID | PK, FK → tags.id | 标签 ID |

**复合主键**，无额外字段。

```python
class ArticleTag(Base):
    __tablename__ = "article_tags"

    article_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("articles.id", ondelete="CASCADE"), primary_key=True
    )
    tag_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True
    )
```

---

### 2.6 favorites（用户收藏表）

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| user_id | UUID | PK, FK → users.id | 用户 ID |
| article_id | UUID | PK, FK → articles.id | 文章 ID |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 收藏时间 |

```python
class Favorite(Base):
    __tablename__ = "favorites"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    article_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("articles.id", ondelete="CASCADE"), primary_key=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
```

---

### 2.7 likes（点赞表）

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| user_id | UUID | PK, FK → users.id | 用户 ID |
| article_id | UUID | PK, FK → articles.id | 文章 ID |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 点赞时间 |

```python
class Like(Base):
    __tablename__ = "likes"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    article_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("articles.id", ondelete="CASCADE"), primary_key=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
```

---

### 2.8 medias（媒体表）

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK, default uuid4 | 主键 |
| filename | VARCHAR(255) | NOT NULL | 原始文件名 |
| stored_filename | VARCHAR(255) | NOT NULL | 存储文件名（UUID 重命名） |
| url | VARCHAR(1024) | NOT NULL | 访问 URL |
| thumbnail_url | VARCHAR(1024) | DEFAULT NULL | 缩略图 URL |
| large_url | VARCHAR(1024) | DEFAULT NULL | 大图 URL |
| size | INT | NOT NULL | 文件大小（字节） |
| width | INT | DEFAULT NULL | 图片宽度（像素） |
| height | INT | DEFAULT NULL | 图片高度（像素） |
| mime_type | VARCHAR(64) | NOT NULL | MIME 类型 |
| upload_type | VARCHAR(32) | DEFAULT 'content' | 用途: `cover` / `content` / `avatar` |
| uploader_id | UUID | FK → users.id, NOT NULL | 上传者 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `idx_medias_uploader_id` ON (uploader_id)
- `idx_medias_mime_type` ON (mime_type)

```python
class Media(Base):
    __tablename__ = "medias"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    stored_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    url: Mapped[str] = mapped_column(String(1024), nullable=False)
    thumbnail_url: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)
    large_url: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)
    size: Mapped[int] = mapped_column(Integer, nullable=False)
    width: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    height: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    mime_type: Mapped[str] = mapped_column(String(64), nullable=False)
    upload_type: Mapped[str] = mapped_column(String(32), nullable=False, default="content")
    uploader_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
```

---

### 2.9 site_settings（网站配置表）

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK, default uuid4 | 主键 |
| site_name | VARCHAR(100) | NOT NULL, DEFAULT 'My Blog' | 网站名称 |
| site_description | VARCHAR(300) | DEFAULT '' | 网站描述 |
| site_logo | VARCHAR(512) | DEFAULT NULL | Logo URL |
| favicon | VARCHAR(512) | DEFAULT NULL | 图标 URL |
| social_github | VARCHAR(255) | DEFAULT '' | GitHub 链接 |
| social_twitter | VARCHAR(255) | DEFAULT '' | Twitter 链接 |
| social_weibo | VARCHAR(255) | DEFAULT '' | 微博链接 |
| custom_footer | TEXT | DEFAULT '' | 自定义页脚 HTML |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

```python
class SiteSetting(Base):
    __tablename__ = "site_settings"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    site_name: Mapped[str] = mapped_column(String(100), nullable=False, default="My Blog")
    site_description: Mapped[str] = mapped_column(String(300), nullable=False, default="")
    site_logo: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    favicon: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    social_github: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    social_twitter: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    social_weibo: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    custom_footer: Mapped[str] = mapped_column(Text, nullable=False, default="")
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
```

---

## 3. 枚举常量

```python
# 用户角色
class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"

# 文章状态
class ArticleStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"

# 文章内容格式
class ContentType(str, Enum):
    HTML = "html"
    MARKDOWN = "markdown"

# 上传用途
class UploadType(str, Enum):
    COVER = "cover"
    CONTENT = "content"
    AVATAR = "avatar"
```

---

## 4. 全文搜索设计

使用 PostgreSQL 的 `pg_trgm` 扩展实现模糊搜索：

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX idx_articles_title_trgm ON articles USING gin (title gin_trgm_ops);
CREATE INDEX idx_articles_summary_trgm ON articles USING gin (summary gin_trgm_ops);
```

搜索时通过 SQLAlchemy 执行：
```python
from sqlalchemy import func
query = select(Article).where(
    func.lower(Article.title).contains(keyword.lower())
    | func.lower(Article.summary).contains(keyword.lower())
)
```

---

## 5. Pydantic Schema 定义（非 ORM 部分）

### 5.1 分页通用 Schema

```python
class Pagination(BaseModel):
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=50)
    total: int = Field(default=0, ge=0)
    total_pages: int = Field(default=0, ge=0)

class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    page_size: int
    total_pages: int
```

### 5.2 统一响应 Schema

```python
class ApiResponse(BaseModel, Generic[T]):
    code: int = 0
    message: str = "ok"
    data: T | None = None
```

---

## 6. Alembic 迁移策略

```bash
# 初始化（首次）
alembic init alembic

# 修改 app/config.py 中的 SQLALCHEMY_DATABASE_URL

# 自动生成迁移
alembic revision --autogenerate -m "init_tables"

# 执行迁移
alembic upgrade head

# 回滚
alembic downgrade -1
```

**alembic/env.py 配置要点：**
- 设置 `target_metadata = Base.metadata`
- import 所有 model 确保被扫描到
- 使用异步引擎（AsyncEngine 包装）
