# 系统架构设计

> 版本: v1.0
> 最后更新: 2026-05-28

---

## 1. 总体架构

### 1.1 架构图

```
┌─────────────────────────────────────────────────────┐
│                       用户层                          │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│   │ Web 前端  │  │  Flutter  │  │  小程序   │         │
│   │ (Next.js) │  │  移动端   │  │ (Taro)   │         │
│   └────┬─────┘  └────┬─────┘  └────┬─────┘         │
│        │             │             │                │
├────────┼─────────────┼─────────────┼────────────────┤
│        │    HTTPS / Nginx           │                │
│        └────────────────────────────┘                │
│                         │                            │
│                  ┌──────┴──────┐                     │
│                  │   Nginx     │                     │
│                  │ (反向代理)   │                     │
│                  └──────┬──────┘                     │
│                         │                            │
│                  ┌──────┴──────┐                     │
│                  │  FastAPI    │                     │
│                  │  后端服务    │                     │
│                  └──────┬──────┘                     │
│                         │                            │
│          ┌──────────────┼──────────────┐            │
│          │              │              │            │
│   ┌──────┴──────┐ ┌────┴────┐ ┌──────┴──────┐     │
│   │ PostgreSQL  │ │  Redis  │ │  MinIO      │     │
│   │  (主数据库)  │ │ (缓存)  │ │ (对象存储)   │     │
│   └─────────────┘ └─────────┘ └─────────────┘     │
└─────────────────────────────────────────────────────┘
```

### 1.2 架构风格

- **前后端分离**：后端提供 RESTful API，前端三端独立消费
- **微服务单体**：后端采用单体应用（单进程 FastAPI），但按模块分包，方便后续拆分
- **无状态鉴权**：使用 JWT Token，后端不维护 session

---

## 2. 完整技术栈

### 2.1 后端

| 组件 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 框架 | FastAPI | ≥0.110 | Python 异步 Web 框架 |
| Python | CPython | ≥3.12 | |
| ASGI 服务器 | Uvicorn | ≥0.29 | 生产用 gunicorn + uvicorn workers |
| ORM | SQLAlchemy | ≥2.0 | 异步模式 (asyncpg) |
| 数据库驱动 | asyncpg | ≥0.30 | 异步 PostgreSQL 驱动 |
| 数据库迁移 | Alembic | ≥1.13 | |
| 缓存 | Redis | ≥7 | 缓存热门文章、Session 替代方案 |
| 对象存储 | MinIO | ≥latest | 图片/文件存储（本地开发），生产可换阿里云OSS/S3 |
| 鉴权 | PyJWT | ≥2.8 | 生成和验证 JWT |
| 密码哈希 | passlib[bcrypt] | ≥1.7 | |
| 表单验证 | Pydantic v2 | 内置 | FastAPI 内置 |
| 图片处理 | Pillow | ≥10 | 图片缩略图生成 |
| 任务队列 | (预留) | — | 后续可接入 Celery / ARQ |
| CORS | fastapi.middleware.cors | 内置 | 允许三端跨域 |

### 2.2 前端 Web

| 组件 | 技术 | 说明 |
|------|------|------|
| 框架 | Next.js 14 | App Router |
| 语言 | TypeScript | |
| 样式 | Tailwind CSS 3 | 配合 design-system |
| 状态管理 | Zustand | 轻量级 |
| HTTP | ky / fetch | |
| 富文本编辑器 | TipTap (ProseMirror) | 后台文章编辑 |
| 图表/高亮 | rehype-pretty-code | 代码高亮 |
| 日期 | dayjs | |

### 2.3 移动端 Flutter

| 组件 | 技术 | 说明 |
|------|------|------|
| 框架 | Flutter 3 | |
| 语言 | Dart 3 | |
| 状态管理 | Riverpod | |
| HTTP | dio | |
| 富文本渲染 | flutter_widget_from_html / flutter_quill | 展示文章内容 |
| 图片 | cached_network_image | |

### 2.4 小程序 (Taro)

| 组件 | 技术 | 说明 |
|------|------|------|
| 框架 | Taro 4 | React 语法 |
| 语言 | TypeScript | |
| 构建 | Vite | |
| UI 组件 | NutUI / Taro UI | |
| 状态管理 | zustand | 与前端 Web 统一 |

### 2.5 部署

| 组件 | 技术 | 说明 |
|------|------|------|
| 容器编排 | Docker + docker-compose | |
| 反向代理 | Nginx | 提供 HTTPS、静态资源托管、API 反向代理 |
| 数据库 | PostgreSQL 16 | |
| 对象存储 | MinIO | 与后端同网络 |
| CI/CD | (预留) | 后续可接入 GitHub Actions |

---

## 3. 目录结构

### 3.1 工作区根目录

```
blog-platform/
├── backend/                # FastAPI 后端
├── frontend/               # Next.js 前端 (Web)
├── mobile/                 # Flutter 移动端
├── miniapp/                # Taro 小程序
├── docker/                 # Docker 配置文件
│   ├── nginx/
│   │   └── nginx.conf
│   ├── backend/
│   │   └── Dockerfile
│   └── frontend/
│       └── Dockerfile
├── docker-compose.yml      # 主编排文件
├── .env.example            # 环境变量模板
├── Makefile                # 常用命令快捷方式
└── README.md
```

### 3.2 后端目录结构

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI 应用入口，注册路由、中间件
│   ├── config.py               # 配置管理（从环境变量读取）
│   ├── dependencies.py         # 依赖注入（当前用户、数据库会话等）
│   ├── api/
│   │   ├── __init__.py
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py         # 注册、登录、刷新 Token
│   │   │   ├── users.py        # 用户信息管理
│   │   │   ├── articles.py     # 文章 CRUD
│   │   │   ├── categories.py   # 分类管理
│   │   │   ├── tags.py         # 标签管理
│   │   │   └── uploads.py      # 图片上传
│   │   └── deps.py             # 路由级依赖
│   ├── models/
│   │   ├── __init__.py
│   │   ├── base.py             # SQLAlchemy Base 声明
│   │   ├── user.py             # User 模型
│   │   ├── article.py          # Article 模型
│   │   ├── category.py         # Category 模型
│   │   ├── tag.py              # Tag 模型
│   │   └── article_tag.py      # 文章-标签多对多关联表
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── auth.py             # 登录/注册请求响应 Schema
│   │   ├── user.py             # User Schema
│   │   ├── article.py          # Article Schema
│   │   ├── category.py         # Category Schema
│   │   ├── tag.py              # Tag Schema
│   │   └── common.py           # 分页、通用响应
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py     # 鉴权业务逻辑
│   │   ├── article_service.py  # 文章业务逻辑
│   │   ├── category_service.py # 分类业务逻辑
│   │   ├── tag_service.py      # 标签业务逻辑
│   │   └── upload_service.py   # 文件上传业务逻辑
│   ├── core/
│   │   ├── __init__.py
│   │   ├── security.py         # JWT 生成/验证、密码哈希
│   │   └── pagination.py       # 分页工具
│   └── utils/
│       ├── __init__.py
│       └── image.py            # 图片处理工具（缩略图、压缩）
├── alembic/
│   ├── versions/
│   └── env.py
├── alembic.ini
├── requirements.txt
├── pyproject.toml
├── Dockerfile
└── tests/
    ├── __init__.py
    ├── conftest.py
    ├── test_auth.py
    ├── test_articles.py
    ├── test_categories.py
    └── test_tags.py
```

### 3.3 前端 Web 目录结构

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # 根布局
│   │   ├── page.tsx            # 首页
│   │   ├── articles/
│   │   │   ├── page.tsx        # 文章列表页
│   │   │   └── [slug]/
│   │   │       └── page.tsx    # 文章详情页
│   │   ├── categories/
│   │   │   └── [slug]/
│   │   │       └── page.tsx    # 分类文章列表
│   │   ├── tags/
│   │   │   └── [slug]/
│   │   │       └── page.tsx    # 标签文章列表
│   │   ├── search/
│   │   │   └── page.tsx        # 搜索页
│   │   ├── about/
│   │   │   └── page.tsx        # 关于页
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── page.tsx    # 登录页
│   │   │   └── register/
│   │   │       └── page.tsx    # 注册页
│   │   └── admin/              # 管理后台路由
│   │       ├── layout.tsx      # 后台布局（侧边栏）
│   │       ├── page.tsx        # 后台首页（Dashboard）
│   │       ├── articles/
│   │       │   ├── page.tsx    # 文章列表管理
│   │       │   ├── new/
│   │       │   │   └── page.tsx    # 新建文章
│   │       │   └── [id]/
│   │       │       └── page.tsx    # 编辑文章
│   │       ├── categories/
│   │       │   └── page.tsx    # 分类管理
│   │       ├── tags/
│   │       │   └── page.tsx    # 标签管理
│   │       ├── media/
│   │       │   └── page.tsx    # 媒体库管理
│   │       ├── users/
│   │       │   └── page.tsx    # 用户管理（管理员）
│   │       └── settings/
│   │           └── page.tsx    # 网站设置
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Sidebar.tsx     # 后台侧边栏
│   │   │   └── AdminLayout.tsx
│   │   ├── article/
│   │   │   ├── ArticleCard.tsx
│   │   │   ├── ArticleList.tsx
│   │   │   ├── ArticleDetail.tsx
│   │   │   └── Editor.tsx      # TipTap 编辑器组件
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Pagination.tsx
│   │   │   ├── Tag.tsx
│   │   │   ├── CategoryBadge.tsx
│   │   │   └── Loading.tsx
│   │   └── auth/
│   │       ├── LoginForm.tsx
│   │       └── RegisterForm.tsx
│   ├── lib/
│   │   ├── api.ts              # API 客户端封装
│   │   ├── auth.ts             # 鉴权工具（Token 存储）
│   │   └── utils.ts            # 工具函数
│   ├── store/
│   │   └── authStore.ts        # Zustand 鉴权状态
│   └── styles/
│       └── globals.css         # Tailwind 入口 + 全局样式
├── public/
│   ├── favicon.ico
│   └── images/
├── tailwind.config.ts
├── next.config.js
├── package.json
├── Dockerfile
└── tsconfig.json
```

### 3.4 Flutter 移动端目录结构

```
mobile/
├── lib/
│   ├── main.dart
│   ├── app.dart                # App 入口，路由配置
│   ├── config/
│   │   ├── api_config.dart     # API 地址、超时等配置
│   │   └── theme.dart          # 主题配置（与设计系统一致）
│   ├── models/
│   │   ├── article.dart
│   │   ├── category.dart
│   │   ├── tag.dart
│   │   ├── user.dart
│   │   └── pagination.dart
│   ├── providers/
│   │   ├── auth_provider.dart
│   │   ├── article_provider.dart
│   │   ├── category_provider.dart
│   │   └── tag_provider.dart
│   ├── services/
│   │   ├── api_service.dart    # Dio 封装
│   │   ├── auth_service.dart
│   │   └── storage_service.dart # 本地存储
│   ├── screens/
│   │   ├── home/
│   │   │   └── home_screen.dart
│   │   ├── articles/
│   │   │   ├── article_list_screen.dart
│   │   │   └── article_detail_screen.dart
│   │   ├── categories/
│   │   │   └── category_screen.dart
│   │   ├── tags/
│   │   │   └── tag_screen.dart
│   │   ├── search/
│   │   │   └── search_screen.dart
│   │   └── settings/
│   │       └── settings_screen.dart
│   ├── widgets/
│   │   ├── article_card.dart
│   │   ├── tag_chip.dart
│   │   ├── category_chip.dart
│   │   └── loading_indicator.dart
│   └── utils/
│       ├── date_formatter.dart
│       └── html_renderer.dart  # 富文本渲染
├── test/
├── pubspec.yaml
└── Dockerfile
```

### 3.5 小程序目录结构

```
miniapp/
├── src/
│   ├── app.config.ts           # 小程序配置
│   ├── app.tsx                 # 入口
│   ├── pages/
│   │   ├── index/
│   │   │   ├── index.tsx       # 首页
│   │   │   └── index.config.ts
│   │   ├── articles/
│   │   │   ├── list.tsx
│   │   │   ├── list.config.ts
│   │   │   ├── detail.tsx
│   │   │   └── detail.config.ts
│   │   ├── categories/
│   │   │   ├── list.tsx
│   │   │   └── list.config.ts
│   │   ├── tags/
│   │   │   ├── list.tsx
│   │   │   └── list.config.ts
│   │   └── search/
│   │       ├── search.tsx
│   │       └── search.config.ts
│   ├── components/
│   │   ├── ArticleCard/
│   │   ├── TagChip/
│   │   └── CategoryBadge/
│   ├── services/
│   │   └── api.ts
│   ├── stores/
│   │   └── userStore.ts
│   └── utils/
│       ├── request.ts          # 请求封装
│       └── constants.ts
├── package.json
├── tsconfig.json
├── project.config.json
└── Dockerfile
```

---

## 4. 部署方案

### 4.1 Docker Compose 服务编排

```yaml
# docker-compose.yml
version: "3.9"

services:
  # ─── 数据库 ───
  postgres:
    image: postgres:16-alpine
    container_name: blog-postgres
    restart: always
    volumes:
      - postgres_data:/var/lib/postgresql/data
    env_file:
      - .env
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - blog-net

  # ─── 缓存 ───
  redis:
    image: redis:7-alpine
    container_name: blog-redis
    restart: always
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - blog-net

  # ─── 对象存储 ───
  minio:
    image: minio/minio:latest
    container_name: blog-minio
    restart: always
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD}
    volumes:
      - minio_data:/data
    ports:
      - "9000:9000"   # API
      - "9001:9001"   # Console
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - blog-net

  # ─── 后端 ───
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: blog-backend
    restart: always
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      minio:
        condition: service_healthy
    env_file:
      - .env
    volumes:
      - uploads:/app/uploads   # 本地文件模式上传目录
    command: >
      sh -c "alembic upgrade head &&
             uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/v1/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - blog-net

  # ─── 前端 Web ───
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: blog-frontend
    restart: always
    depends_on:
      - backend
    env_file:
      - .env
    networks:
      - blog-net

  # ─── Nginx 反向代理 ───
  nginx:
    image: nginx:1.25-alpine
    container_name: blog-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - ./docker/nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - backend
      - frontend
    networks:
      - blog-net

networks:
  blog-net:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
  minio_data:
  uploads:
```

### 4.2 Nginx 配置

```nginx
# docker/nginx/nginx.conf
server {
    listen 80;
    server_name example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    # ─── 静态资源缓存 ───
    location /_next/static {
        proxy_pass http://frontend:3000;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    # ─── 前端 ───
    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # ─── API ───
    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 大文件上传支持
        client_max_body_size 20M;
    }

    # ─── MinIO 图片直链（可选） ───
    location /media/ {
        proxy_pass http://minio:9000/;
        proxy_set_header Host $host;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### 4.3 环境变量 (.env.example)

```bash
# ── Django Secret (FastAPI) ──
SECRET_KEY=change_me_in_production
ACCESS_TOKEN_EXPIRE_MINUTES=1440
REFRESH_TOKEN_EXPIRE_DAYS=30

# ── PostgreSQL ──
POSTGRES_USER=blog
POSTGRES_PASSWORD=change_me
POSTGRES_DB=blog_db
DATABASE_URL=postgresql+asyncpg://blog:change_me@postgres:5432/blog_db

# ── Redis ──
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=change_me
REDIS_URL=redis://default:change_me@redis:6379/0

# ── MinIO ──
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=change_me
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=change_me
MINIO_BUCKET_NAME=blog-media
MINIO_PUBLIC_URL=http://localhost:9000

# ── Frontend ──
NEXT_PUBLIC_API_BASE_URL=https://example.com/api/v1
NEXT_PUBLIC_MEDIA_URL=https://example.com/media

# ── Upload ──
UPLOAD_MODE=s3          # s3 | local
UPLOAD_DIR=/app/uploads
MAX_UPLOAD_SIZE=20971520  # 20MB
```

### 4.4 后端 Dockerfile

```dockerfile
# backend/Dockerfile
FROM python:3.12-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libpq-dev && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /wheels -r requirements.txt

# ─── 运行阶段 ───
FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev curl && \
    rm -rf /var/lib/apt/lists/*

COPY --from=builder /wheels /wheels
COPY --from=builder /app /app

RUN pip install --no-cache-dir /wheels/*

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 4.5 前端 Dockerfile

```dockerfile
# frontend/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ─── 运行阶段 ───
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["node_modules/.bin/next", "start"]
```

### 4.6 部署流程

```bash
# 1. 克隆项目
git clone <repo-url> && cd blog-platform

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env，填入实际值

# 3. 一键启动
docker compose up -d

# 4. 初始化 MinIO Bucket（首次）
docker compose exec minio mc alias set local http://localhost:9000 minioadmin <password>
docker compose exec minio mc mb local/blog-media
docker compose exec minio mc anonymous set public local/blog-media

# 5. 查看日志
docker compose logs -f

# 6. 停止
docker compose down

# 7. 完全清理（含数据卷）
docker compose down -v
```

### 4.7 生产环境注意事项

- **HTTPS**：生产环境使用 Let's Encrypt（certbot）自动续签证书
- **数据库备份**：使用 pg_dump 定期备份，或接入 pgBackRest
- **监控**：可接入 Prometheus + Grafana 监控后端指标
- **CDN**：静态资源（图片）推荐接入 CDN 加速
- **多环境**：开发/测试/生产三套 docker-compose 配置（通过 `-f` 组合）

---

## 5. API 设计规范

### 5.1 URL 前缀

```
所有 API 统一前缀: /api/v1
示例: GET /api/v1/articles
```

### 5.2 统一响应格式

```json
// 成功响应
{
  "code": 0,
  "message": "ok",
  "data": { ... }
}

// 分页响应
{
  "code": 0,
  "message": "ok",
  "data": {
    "items": [ ... ],
    "total": 100,
    "page": 1,
    "page_size": 20,
    "total_pages": 5
  }
}

// 错误响应
{
  "code": 40101,
  "message": "登录凭证已过期",
  "data": null
}
```

### 5.3 HTTP 方法语义

| 方法 | 语义 |
|------|------|
| GET | 查询（无副作用） |
| POST | 创建资源 / 提交操作 |
| PUT | 全量更新资源 |
| PATCH | 部分更新资源 |
| DELETE | 删除资源 |

### 5.4 鉴权方式

- **JWT Bearer Token**：请求头 `Authorization: Bearer <access_token>`
- **Access Token**：有效期 24 小时
- **Refresh Token**：有效期 30 天，用于刷新 Access Token

---

## 6. 图片上传方案

### 6.1 存储模式

| 模式 | 适用环境 | 说明 |
|------|----------|------|
| S3 (MinIO) | 开发/生产 | 对象存储，可生成签名 URL |
| local | 开发 | 存本地目录，Nginx 静态代理 |

### 6.2 图片处理流程

```
用户上传 → API 接收 → 校验类型/大小 → 生成缩略图 → 存储 → 返回 URL
                                                      ↓
                                             文章内容引用该 URL
```

- 支持格式: JPEG, PNG, GIF, WebP, SVG
- 最大文件: 20MB
- 自动生成三种尺寸：原始 / large (1200px宽) / thumbnail (300px宽)

---

## 7. 安全设计

| 项目 | 方案 |
|------|------|
| 密码存储 | bcrypt 哈希（passlib） |
| 鉴权 | JWT (HS256) |
| API 防刷 | 后期可加 Rate Limiting（Redis） |
| XSS | 后端对富文本做 HTML 清洗（bleach） |
| CORS | 白名单允许三端域名 |
| SQL 注入 | SQLAlchemy ORM 天然防护 |
| 文件上传 | 校验 MIME + 魔数，限制扩展名 |
