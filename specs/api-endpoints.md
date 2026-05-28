# API 端点定义

> 版本: v1.0
> 最后更新: 2026-05-28
> 统一前缀: `/api/v1`
> 三端（Web 前台 / Flutter 移动端 / Taro 小程序）共用同一套后端 API

---

## 1. 健康检查

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/api/v1/health` | 否 | 后端健康检查 |

**Response:**
```json
{
  "code": 0,
  "message": "ok",
  "data": { "status": "healthy", "version": "1.0.0" }
}
```

---

## 2. 用户认证 (Auth)

### 2.1 注册

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| POST | `/api/v1/auth/register` | 否 | 用户注册 |

**Request:**
```json
{
  "username": "zhangsan",
  "email": "zhangsan@example.com",
  "password": "Abc12345!",
  "nickname": "张三"
}
```

| 字段 | 类型 | 必填 | 约束 |
|------|------|------|------|
| username | string | 是 | 3-32 字符，字母数字下划线 |
| email | string | 是 | 合法邮箱格式 |
| password | string | 是 | 8-128 字符，至少包含大写字母、小写字母、数字 |
| nickname | string | 否 | 1-32 字符，默认与 username 相同 |

**Response (201):**
```json
{
  "code": 0,
  "message": "注册成功",
  "data": {
    "user": {
      "id": "uuid-string",
      "username": "zhangsan",
      "email": "zhangsan@example.com",
      "nickname": "张三",
      "role": "user",
      "created_at": "2026-05-28T10:00:00Z"
    },
    "access_token": "eyJ...",
    "refresh_token": "eyJ..."
  }
}
```

**Error (409):** 用户名或邮箱已存在

### 2.2 登录

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| POST | `/api/v1/auth/login` | 否 | 用户登录 |

**Request:**
```json
{
  "username": "zhangsan",
  "password": "Abc12345!"
}
```

| 字段 | 类型 | 必填 | 约束 |
|------|------|------|------|
| username | string | 是 | 用户名或邮箱均可 |
| password | string | 是 | |

**Response (200):**
```json
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "user": {
      "id": "uuid-string",
      "username": "zhangsan",
      "email": "zhangsan@example.com",
      "nickname": "张三",
      "role": "admin",
      "avatar": "https://...",
      "created_at": "2026-05-28T10:00:00Z"
    },
    "access_token": "eyJ...",
    "refresh_token": "eyJ..."
  }
}
```

**Error (401):** 用户名或密码错误

### 2.3 刷新 Token

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| POST | `/api/v1/auth/refresh` | 否（需 refresh_token） | 刷新 Access Token |

**Request:**
```json
{
  "refresh_token": "eyJ..."
}
```

**Response (200):**
```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "access_token": "eyJ...",
    "refresh_token": "eyJ..."
  }
}
```

### 2.4 退出登录

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| POST | `/api/v1/auth/logout` | 是 | 退出登录（弃用 refresh token） |

**Request:** (Body 可选)
```json
{
  "refresh_token": "eyJ..."
}
```

**Response (200):**
```json
{
  "code": 0,
  "message": "已退出登录",
  "data": null
}
```

### 2.5 获取当前用户信息

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/api/v1/auth/me` | 是 | 获取当前登录用户信息 |

**Response (200):**
```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "id": "uuid-string",
    "username": "zhangsan",
    "email": "zhangsan@example.com",
    "nickname": "张三",
    "avatar": "https://...",
    "role": "admin",
    "bio": "热爱写代码",
    "created_at": "2026-05-28T10:00:00Z",
    "updated_at": "2026-05-28T10:00:00Z"
  }
}
```

---

## 3. 文章 (Articles)

### 3.1 获取文章列表（公开）

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/api/v1/articles` | 否 | 文章列表（分页、筛选） |

**Query Parameters:**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | int | 否 | 1 | 页码 |
| page_size | int | 否 | 20 | 每页数量，最大 50 |
| category_slug | string | 否 | — | 按分类筛选 |
| tag_slug | string | 否 | — | 按标签筛选 |
| keyword | string | 否 | — | 搜索关键词（匹配标题+摘要） |
| sort | string | 否 | created_at_desc | 排序: `created_at_desc`, `created_at_asc`, `views_desc` |
| status | string | 否 | published | 仅管理员可传 `draft` 查看草稿 |

**Response (200):**
```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "items": [
      {
        "id": "uuid-string",
        "title": "如何用 FastAPI 搭建博客",
        "slug": "how-to-build-blog-with-fastapi",
        "summary": "本文详细介绍如何...",
        "cover_image": "https://.../cover.jpg",
        "category": {
          "id": "uuid-string",
          "name": "技术",
          "slug": "tech"
        },
        "tags": [
          { "id": "uuid-string", "name": "Python", "slug": "python" },
          { "id": "uuid-string", "name": "FastAPI", "slug": "fastapi" }
        ],
        "author": {
          "id": "uuid-string",
          "nickname": "管理员",
          "avatar": "https://..."
        },
        "views_count": 1280,
        "likes_count": 56,
        "comment_count": 12,
        "is_pinned": false,
        "published_at": "2026-05-20T08:00:00Z",
        "created_at": "2026-05-20T08:00:00Z"
      }
    ],
    "total": 100,
    "page": 1,
    "page_size": 20,
    "total_pages": 5
  }
}
```

### 3.2 获取文章详情（公开）

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/api/v1/articles/{slug}` | 否 | 文章详情 |

**Response (200):**
```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "id": "uuid-string",
    "title": "如何用 FastAPI 搭建博客",
    "slug": "how-to-build-blog-with-fastapi",
    "summary": "本文详细介绍如何...",
    "content": "<h2>引言</h2><p>...</p>",
    "content_type": "html",
    "cover_image": "https://.../cover.jpg",
    "category": {
      "id": "uuid-string",
      "name": "技术",
      "slug": "tech"
    },
    "tags": [
      { "id": "uuid-string", "name": "Python", "slug": "python" }
    ],
    "author": {
      "id": "uuid-string",
      "nickname": "管理员",
      "avatar": "https://..."
    },
    "views_count": 1280,
    "likes_count": 56,
    "comment_count": 12,
    "is_pinned": false,
    "is_liked": false,
    "is_favorited": false,
    "published_at": "2026-05-20T08:00:00Z",
    "created_at": "2026-05-20T08:00:00Z",
    "updated_at": "2026-05-28T10:00:00Z",
    "prev_article": {
      "id": "uuid-string",
      "title": "上一篇标题",
      "slug": "prev-slug"
    },
    "next_article": {
      "id": "uuid-string",
      "title": "下一篇标题",
      "slug": "next-slug"
    }
  }
}
```

### 3.3 创建文章（后台管理，需管理员）

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| POST | `/api/v1/articles` | 是 (admin) | 创建新文章 |

**Request:**
```json
{
  "title": "如何用 FastAPI 搭建博客",
  "slug": "how-to-build-blog-with-fastapi",
  "summary": "本文详细介绍如何...",
  "content": "<h2>引言</h2><p>...</p>",
  "content_type": "html",
  "cover_image": "https://.../cover.jpg",
  "category_id": "uuid-string",
  "tag_ids": ["uuid-1", "uuid-2"],
  "is_pinned": false,
  "status": "published"
}
```

| 字段 | 类型 | 必填 | 约束 |
|------|------|------|------|
| title | string | 是 | 1-200 字符 |
| slug | string | 否 | 自动由 title 生成；可自定义，需唯一 |
| summary | string | 否 | 0-500 字符 |
| content | string | 是 | 富文本 HTML |
| content_type | string | 否 | 默认 "html"，可选 "markdown" |
| cover_image | string | 否 | 已上传图片的 URL |
| category_id | uuid | 否 | 分类 ID |
| tag_ids | uuid[] | 否 | 标签 ID 列表 |
| is_pinned | boolean | 否 | 是否置顶 |
| status | string | 否 | 默认 "draft"，可选 "published" |

**Response (201):**
```json
{
  "code": 0,
  "message": "文章创建成功",
  "data": {
    "id": "uuid-string",
    "slug": "how-to-build-blog-with-fastapi"
  }
}
```

### 3.4 更新文章（后台管理，需管理员）

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| PUT | `/api/v1/articles/{id}` | 是 (admin) | 全量更新文章 |

**Request:** 同创建文章

**Response (200):**
```json
{
  "code": 0,
  "message": "文章更新成功",
  "data": { "id": "uuid-string" }
}
```

### 3.5 删除文章（后台管理，需管理员）

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| DELETE | `/api/v1/articles/{id}` | 是 (admin) | 删除文章 |

**Response (200):**
```json
{
  "code": 0,
  "message": "文章已删除",
  "data": null
}
```

### 3.6 切换文章状态（发布/草稿）

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| PATCH | `/api/v1/articles/{id}/status` | 是 (admin) | 切换发布状态 |

**Request:**
```json
{
  "status": "published"
}
```

**Response (200):**
```json
{
  "code": 0,
  "message": "状态已更新",
  "data": { "status": "published" }
}
```

### 3.7 点赞/取消点赞文章

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| POST | `/api/v1/articles/{id}/like` | 是 | 点赞（取消则再调一次） |

**Response (200):**
```json
{
  "code": 0,
  "message": "ok",
  "data": { "is_liked": true, "likes_count": 57 }
}
```

### 3.8 收藏/取消收藏文章

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| POST | `/api/v1/articles/{id}/favorite` | 是 | 收藏/取消 |

**Response (200):**
```json
{
  "code": 0,
  "message": "ok",
  "data": { "is_favorited": true }
}
```

### 3.9 获取用户收藏列表

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/api/v1/articles/favorites` | 是 | 当前用户收藏的文章 |

**Query:** 同文章列表

---

## 4. 分类 (Categories)

### 4.1 获取分类列表

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/api/v1/categories` | 否 | 所有分类（含文章数） |

**Response (200):**
```json
{
  "code": 0,
  "message": "ok",
  "data": [
    {
      "id": "uuid-string",
      "name": "技术",
      "slug": "tech",
      "description": "技术相关文章",
      "article_count": 42,
      "order": 1,
      "created_at": "2026-05-01T00:00:00Z"
    },
    {
      "id": "uuid-string",
      "name": "生活",
      "slug": "life",
      "description": "生活随笔",
      "article_count": 15,
      "order": 2,
      "created_at": "2026-05-01T00:00:00Z"
    }
  ]
}
```

### 4.2 获取单条分类

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/api/v1/categories/{slug}` | 否 | 分类详情 |

### 4.3 创建分类（管理员）

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| POST | `/api/v1/categories` | 是 (admin) | 新建分类 |

**Request:**
```json
{
  "name": "技术",
  "slug": "tech",
  "description": "技术相关文章",
  "order": 1
}
```

| 字段 | 类型 | 必填 | 约束 |
|------|------|------|------|
| name | string | 是 | 1-32 字符，唯一 |
| slug | string | 否 | 自动由 name 生成，唯一 |
| description | string | 否 | 0-200 字符 |
| order | int | 否 | 排序权重，升序 |

### 4.4 更新分类（管理员）

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| PUT | `/api/v1/categories/{id}` | 是 (admin) | |

### 4.5 删除分类（管理员）

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| DELETE | `/api/v1/categories/{id}` | 是 (admin) | 已有文章的分类不可删除 |

**Error (400):** 分类下还有文章，无法删除

---

## 5. 标签 (Tags)

### 5.1 获取标签列表

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/api/v1/tags` | 否 | 所有标签（含文章数） |

**Response (200):**
```json
{
  "code": 0,
  "message": "ok",
  "data": [
    {
      "id": "uuid-string",
      "name": "Python",
      "slug": "python",
      "article_count": 10,
      "created_at": "2026-05-01T00:00:00Z"
    }
  ]
}
```

### 5.2 获取热门标签

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/api/v1/tags/hot` | 否 | 按文章数排序的前 N 个标签 |

**Query:** `limit=10`（默认 10，最大 30）

### 5.3 创建标签（管理员）

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| POST | `/api/v1/tags` | 是 (admin) | |

**Request:**
```json
{
  "name": "Python",
  "slug": "python"
}
```

### 5.4 更新标签（管理员）

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| PUT | `/api/v1/tags/{id}` | 是 (admin) | |

### 5.5 删除标签（管理员）

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| DELETE | `/api/v1/tags/{id}` | 是 (admin) | 级联删除关联关系 |

---

## 6. 文件上传 (Media)

### 6.1 上传图片

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| POST | `/api/v1/upload/image` | 是 (admin) | 上传单张图片 |

**Request:** `multipart/form-data`

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | File | 是 | 图片文件 |
| type | string | 否 | 用途：`cover` / `content` / `avatar` |

**Response (201):**
```json
{
  "code": 0,
  "message": "上传成功",
  "data": {
    "id": "uuid-string",
    "url": "https://.../uploads/2026/05/abc123.jpg",
    "thumbnail_url": "https://.../uploads/2026/05/thumb_abc123.jpg",
    "large_url": "https://.../uploads/2026/05/large_abc123.jpg",
    "filename": "abc123.jpg",
    "size": 2048576,
    "width": 1920,
    "height": 1080,
    "mime_type": "image/jpeg",
    "created_at": "2026-05-28T10:00:00Z"
  }
}
```

### 6.2 批量上传图片

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| POST | `/api/v1/upload/images` | 是 (admin) | 批量上传（最大 10 张） |

**Request:** `multipart/form-data`

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| files | File[] | 是 | 图片文件数组 |

**Response (201):** 返回图片对象数组

### 6.3 获取媒体列表

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/api/v1/media` | 是 (admin) | 媒体库列表（分页） |

**Query:** `page`, `page_size`, `mime_type` (可选按类型筛选)

### 6.4 删除媒体

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| DELETE | `/api/v1/media/{id}` | 是 (admin) | 删除图片（含所有尺寸副本） |

---

## 7. 用户管理 (Users)

### 7.1 获取用户列表（管理员）

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/api/v1/users` | 是 (admin) | 用户列表（分页） |

**Query:** `page`, `page_size`, `role`（可选筛选角色）

### 7.2 获取用户详情

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/api/v1/users/{id}` | 是 (admin) | 用户详情 |

### 7.3 更新用户信息

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| PUT | `/api/v1/users/{id}` | 是 (admin) | 管理员更新用户信息 |

### 7.4 更新个人资料

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| PUT | `/api/v1/auth/profile` | 是 | 用户更新自己的资料 |

**Request:**
```json
{
  "nickname": "张三",
  "bio": "热爱写代码",
  "avatar": "https://..."
}
```

### 7.5 修改密码

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| PUT | `/api/v1/auth/password` | 是 | 修改当前用户密码 |

**Request:**
```json
{
  "old_password": "Abc12345!",
  "new_password": "Xyz67890!"
}
```

### 7.6 删除用户（管理员）

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| DELETE | `/api/v1/users/{id}` | 是 (admin) | 硬删除用户 |

---

## 8. 网站配置 (Settings)

### 8.1 获取公开配置

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/api/v1/settings/public` | 否 | 网站名称、Logo、社交链接等 |

**Response (200):**
```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "site_name": "张三的博客",
    "site_description": "记录技术成长",
    "site_logo": "https://.../logo.png",
    "favicon": "https://.../favicon.ico",
    "social_links": {
      "github": "https://github.com/zhangsan",
      "twitter": "https://twitter.com/zhangsan"
    }
  }
}
```

### 8.2 更新网站配置（管理员）

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| PUT | `/api/v1/settings` | 是 (admin) | 更新配置 |

---

## 9. 评论 (Comments) — 预留

> 第一期不实现评论功能，预留 endpoint 空间。

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/api/v1/articles/{id}/comments` | 否 | 文章评论列表 |
| POST | `/api/v1/articles/{id}/comments` | 是 | 发表评论 |
| DELETE | `/api/v1/comments/{id}` | 是 (admin/owner) | 删除评论 |

---

## 10. 错误码定义

| 错误码 | HTTP 状态 | 含义 |
|--------|-----------|------|
| 0 | 200/201 | 成功 |
| 40000 | 400 | 请求参数错误 |
| 40001 | 422 | 参数验证失败 |
| 40100 | 401 | 未认证（缺少 Token） |
| 40101 | 401 | Token 过期 |
| 40102 | 401 | Token 无效 |
| 40300 | 403 | 权限不足（非管理员操作管理员接口） |
| 40400 | 404 | 资源不存在 |
| 40900 | 409 | 资源冲突（用户名/邮箱已存在） |
| 40901 | 409 | Slug 重复 |
| 41300 | 413 | 上传文件过大 |
| 41500 | 415 | 不支持的媒体类型 |
| 42900 | 429 | 请求过于频繁 |
| 50000 | 500 | 服务器内部错误 |

---

## 11. API 总表

| # | 方法 | 路径 | 鉴权 | 端 |
|---|------|------|------|-----|
| 1 | GET | `/api/v1/health` | — | 全部 |
| 2 | POST | `/api/v1/auth/register` | — | 全部 |
| 3 | POST | `/api/v1/auth/login` | — | 全部 |
| 4 | POST | `/api/v1/auth/refresh` | — | 全部 |
| 5 | POST | `/api/v1/auth/logout` | 是 | 全部 |
| 6 | GET | `/api/v1/auth/me` | 是 | 全部 |
| 7 | PUT | `/api/v1/auth/profile` | 是 | 全部 |
| 8 | PUT | `/api/v1/auth/password` | 是 | 全部 |
| 9 | GET | `/api/v1/articles` | 可选 | 全部 |
| 10 | GET | `/api/v1/articles/{slug}` | 可选 | 全部 |
| 11 | POST | `/api/v1/articles` | 是 (admin) | Web 后台 |
| 12 | PUT | `/api/v1/articles/{id}` | 是 (admin) | Web 后台 |
| 13 | DELETE | `/api/v1/articles/{id}` | 是 (admin) | Web 后台 |
| 14 | PATCH | `/api/v1/articles/{id}/status` | 是 (admin) | Web 后台 |
| 15 | POST | `/api/v1/articles/{id}/like` | 是 | 全部 |
| 16 | POST | `/api/v1/articles/{id}/favorite` | 是 | 全部 |
| 17 | GET | `/api/v1/articles/favorites` | 是 | 全部 |
| 18 | GET | `/api/v1/categories` | — | 全部 |
| 19 | GET | `/api/v1/categories/{slug}` | — | 全部 |
| 20 | POST | `/api/v1/categories` | 是 (admin) | Web 后台 |
| 21 | PUT | `/api/v1/categories/{id}` | 是 (admin) | Web 后台 |
| 22 | DELETE | `/api/v1/categories/{id}` | 是 (admin) | Web 后台 |
| 23 | GET | `/api/v1/tags` | — | 全部 |
| 24 | GET | `/api/v1/tags/hot` | — | 全部 |
| 25 | POST | `/api/v1/tags` | 是 (admin) | Web 后台 |
| 26 | PUT | `/api/v1/tags/{id}` | 是 (admin) | Web 后台 |
| 27 | DELETE | `/api/v1/tags/{id}` | 是 (admin) | Web 后台 |
| 28 | POST | `/api/v1/upload/image` | 是 (admin) | Web 后台 |
| 29 | POST | `/api/v1/upload/images` | 是 (admin) | Web 后台 |
| 30 | GET | `/api/v1/media` | 是 (admin) | Web 后台 |
| 31 | DELETE | `/api/v1/media/{id}` | 是 (admin) | Web 后台 |
| 32 | GET | `/api/v1/users` | 是 (admin) | Web 后台 |
| 33 | GET | `/api/v1/users/{id}` | 是 (admin) | Web 后台 |
| 34 | PUT | `/api/v1/users/{id}` | 是 (admin) | Web 后台 |
| 35 | DELETE | `/api/v1/users/{id}` | 是 (admin) | Web 后台 |
| 36 | GET | `/api/v1/settings/public` | — | 全部 |
| 37 | PUT | `/api/v1/settings` | 是 (admin) | Web 后台 |
