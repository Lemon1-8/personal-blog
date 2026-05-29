# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概览

全栈个人博客系统 — Next.js 14 前端 + FastAPI 后端 + PostgreSQL 数据库。当前仅有 Web 前端已实现，Flutter/小程序在规划中未开发。

## 常用命令

```bash
# === 数据库 ===
docker compose up -d                           # 启动 PostgreSQL (端口 5432)

# === 后端 (需要 Python ≥3.12) ===
cd src/backend
pip install -r requirements.txt                # 安装依赖
cp .env.example .env                           # 配置环境变量
alembic upgrade head                           # 数据库迁移
python seed.py                                 # 写入测试数据（可选）
uvicorn app.main:app --host 0.0.0.0 --port 8000

# === 前端 (需要 Node ≥20) ===
cd src/frontend
npm install
npm run dev                                    # 开发服务器 → http://localhost:3000
npm run build                                  # 生产构建
npm test                                       # 运行 Jest 测试
npm run lint                                   # ESLint 检查

# === API 文档 ===
# 后端启动后访问 http://localhost:8000/docs
```

**默认管理员**: `admin` / `Admin123!`

## 架构要点

### 前端 (Next.js 14 App Router)

- **所有页面都是 `'use client'`**，无 SSR/服务器组件，数据通过客户端 fetch 从后端 API 加载
- **状态管理**: Zustand 仅用于 `authStore`（用户登录状态 + Token 持久化至 localStorage）
- **API 客户端**: `src/lib/api.ts` — 所有 36 个后端 endpoint 的 TypeScript 封装，base URL 硬编码为 `http://localhost:8000/api/v1`
- **Markdown 渲染**: 文章内容用 `marked` 库在客户端实时转换，`ArticleDetail.tsx` 中 `useMemo` + `marked.parse()`，CSS 样式定义在 `globals.css` 的 `.article-content` 类中
- **字体**: 通过 Google Fonts `<link>` 加载 Noto Serif SC（标题衬线）+ DM Sans（正文）+ JetBrains Mono（代码），定义在 `layout.tsx` 的 `<head>` 中
- **路由约定**: `useSearchParams()` 的页面必须用 `<Suspense>` 包裹，否则构建报错

### 后端 (FastAPI)

- **架构**: API 路由 → Service 层 → SQLAlchemy 2.0 异步 ORM → PostgreSQL
- **鉴权**: JWT Bearer Token（access 24h / refresh 30d），中间件链 `get_current_user` → `get_admin_user`
- **Schema 分离**: `ArticleCreate`（创建）、`ArticleUpdate`（全可选字段，支持部分更新）、`ArticleListItem`（列表/详情出参）
- **统一响应**: `{ code: 0, message: "ok", data: ... }`，分页 `data: { items, total, page, page_size, total_pages }`

### 设计系统 (当前实际使用，非 specs 文档)

- **色彩**: `ink` (暖墨色 50-900)、`vermilion` (朱红 50-900)、`amber` (琥珀金 50-900) — 定义在 `tailwind.config.ts`
- **字体**: `font-serif` (Noto Serif SC)、`font-sans` (DM Sans + 中文字体回退)、`font-mono` (JetBrains Mono)
- **圆角**: 全局使用 `rounded-sm` ~ `rounded-md`（硬朗风格），无 `rounded-xl`/`rounded-full`
- **阴影**: `shadow-card` / `shadow-card-hover` / `shadow-float`
- **文章排版**: 首段首字下沉、H2 底部双线、H3 左侧竖线、列表金色圆点 — 全部在 `globals.css`

## 注意事项

- **`next build` 与 `next dev` 冲突**: build 后用 `rm -rf .next` 删缓存再 `npm run dev`，否则 404
- **后端 API 中文编码**: bash 中 curl POST 中文数据时避免 `-d` 内联 JSON，改用 `-d @tempfile`
- **Windows 上 Python 路径**: `C:\Users\lemon\AppData\Local\Programs\Python\Python312\python.exe`
- **specs/ 目录过时**: 设计文档描述的是蓝白配色方案（blue-600），实际 UI 已重写为暖纸墨色系，以代码为准
- **`ArticleUpdate` 全可选**: 后端 PUT `/articles/{id}` 所有字段都是 `Optional`，可以只传单个字段做部分更新（如置顶切换只需 `{ is_pinned: bool }`）
- **Dead code**: `src/lib/utils.ts` 中的 `truncate` 函数已被移除，项目使用 `marked` 做 markdown→HTML 而非后端渲染
