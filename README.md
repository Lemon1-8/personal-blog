# Lemon Blog

个人博客系统，展示项目实战经验与技术总结。全栈架构：Next.js 14 前端 + FastAPI 后端 + PostgreSQL。

## 界面

暖纸墨色的编辑式排版风格 — Noto Serif SC 衬线标题、DM Sans 正文、朱红点缀、文章首字下沉。

![首页](screenshots/homepage.png)

## 功能

**前台**
- 文章列表（分页）、分类/标签筛选、关键词搜索
- 文章详情：Markdown 渲染、首字下沉、代码高亮
- 置顶文章优先展示
- 点赞、收藏（需登录）
- 关于页、标签云

**后台** (`/admin`)
- 文章 CRUD（Markdown 编辑器 + 实时预览）
- 一键置顶/取消置顶
- 分类、标签管理
- 媒体库上传
- 用户管理（RBAC）
- 站点设置

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Next.js 14 · TypeScript · Tailwind CSS 3 · Zustand · marked · dayjs |
| 后端 | FastAPI · SQLAlchemy 2.0 (async) · Alembic · PyJWT · Pydantic v2 |
| 数据库 | PostgreSQL 16 |
| 部署 | Docker Compose |

## 快速启动

**前置条件**: Docker、Python ≥3.12、Node.js ≥20

```bash
# 1. 数据库
docker compose up -d

# 2. 后端
cd src/backend
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
uvicorn app.main:app --host 0.0.0.0 --port 8000

# 3. 前端
cd src/frontend
npm install
npm run dev
```

- 前台: `http://localhost:3000`
- 后台: `http://localhost:3000/admin`
- API 文档: `http://localhost:8000/docs`
- 默认账号: `admin` / `Admin123!`

## 测试

```bash
cd src/frontend && npm test          # 前端单元测试 (Jest)
cd src/backend && pytest tests/ -v   # 后端 API 测试
```

## 项目结构

```
├── docker-compose.yml        # PostgreSQL
├── specs/                    # 架构设计文档
├── src/
│   ├── frontend/             # Next.js 14 (App Router)
│   │   └── src/
│   │       ├── app/          # 21 个页面路由
│   │       ├── components/   # layout / article / ui / auth
│   │       ├── lib/          # API 客户端 + 工具函数
│   │       ├── store/        # Zustand 状态管理
│   │       └── styles/       # Tailwind + 全局样式
│   └── backend/              # FastAPI
│       └── app/
│           ├── api/v1/       # 8 个路由模块 (36 个端点)
│           ├── models/       # 9 个 ORM 模型
│           ├── services/     # 业务逻辑层
│           └── core/         # JWT 鉴权 + 分页
└── tests/                    # 集成测试
```

## API 模块

| 模块 | 端点 | 说明 |
|------|------|------|
| Auth | 7 | 注册、登录、Token 刷新 |
| Articles | 9 | CRUD、置顶切换、点赞、收藏 |
| Categories | 5 | 分类管理 |
| Tags | 5 | 标签管理、热门标签 |
| Media | 4 | 图片上传 |
| Users | 4 | 用户管理 |
| Settings | 2 | 站点配置 |

## License

MIT
