# 个人博客系统

一个全栈个人博客系统，支持前台展示 + 后台管理 + 用户系统。

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 Web | Next.js 14 + TypeScript + Tailwind CSS |
| 后端 API | FastAPI + SQLAlchemy 2.0 + PostgreSQL |
| 部署 | Docker + docker-compose |

## 快速启动

### 前置条件

- Docker & docker-compose
- Python ≥ 3.12
- Node.js ≥ 20

### 1. 启动数据库

```bash
docker compose up -d
```

### 2. 启动后端

```bash
cd src/backend

# 安装依赖
pip install -r requirements.txt

# 配环境变量（按需修改）
cp .env.example .env

# 数据库迁移
alembic upgrade head

# 写入测试数据
python seed.py

# 启动服务
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

API 文档：`http://localhost:8000/docs`

### 3. 启动前端

```bash
cd src/frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问：`http://localhost:3000`

### 4. 登录

- 前台：直接访问首页浏览文章
- 后台：`http://localhost:3000/admin`
- 账号：`admin` / `Admin123!`

## 项目结构

```
blog/
├── docker-compose.yml      # PostgreSQL 数据库
├── specs/                   # 架构设计文档
│   ├── architecture.md      # 技术栈、目录结构、部署方案
│   ├── api-endpoints.md     # 36 个 API 端点定义
│   ├── data-model.md        # 9 张数据表设计
│   ├── routes.md            # 前台/后台/移动端路由
│   └── design-system.md     # UI 色彩/组件/排版规范
├── src/
│   ├── frontend/            # Next.js 前端
│   │   ├── src/app/         # 21 个页面（前台 12 + 后台 9）
│   │   ├── src/components/  # 16 个可复用组件
│   │   └── src/lib/         # API 调用层
│   └── backend/             # FastAPI 后端
│       ├── app/api/v1/      # 8 个路由模块
│       ├── app/models/      # 9 个 ORM 模型
│       ├── app/services/    # 7 个服务层
│       └── app/core/        # JWT 鉴权 + 分页工具
└── tests/                   # 集成测试报告
```

## API 总览

后端提供 RESTful API，统一前缀 `/api/v1`：

| 模块 | 端点数 | 说明 |
|------|--------|------|
| Auth | 7 | 注册、登录、刷新 Token、个人信息 |
| Articles | 9 | 文章列表/详情/CRUD、状态切换、点赞、收藏 |
| Categories | 5 | 分类 CRUD（有文章时禁止删除） |
| Tags | 5 | 标签 CRUD、热门标签 |
| Media | 4 | 单张/批量上传、列表、删除 |
| Users | 4 | 用户列表/详情/编辑/删除 |
| Settings | 2 | 公开配置读取/更新 |

完整定义见 `specs/api-endpoints.md`。

## 测试

```bash
# 前端（61 个测试）
cd src/frontend && npm test

# 后端（71 个测试）
cd src/backend && pytest tests/ -v
```

## 项目背景

本项目由 AI 开发团队协作完成，团队基于 OpenClaw 的多 Agent 工作流：

1. **Architect** — 输出完整设计文档（specs/）
2. **Frontend** — 实现 Next.js 页面和组件
3. **Backend** — 实现 FastAPI 后端和数据库
4. **Tester** — 集成测试，36 个 API 全部对齐

详细流程见项目根目录的 `openclaw-team/` 团队模板。
