# Specs 目录

这里存放当前项目的完整设计契约。

## 文件列表

| 文件 | 用途 | 由谁产出 |
|---|---|---|
| `architecture.md` | 技术栈 / 目录结构 / 部署方案 | Architect |
| `api-endpoints.md` | 接口路径 / 方法 / 请求体 / 响应 | Architect |
| `data-model.md` | 数据模型 / ER 图 / JSON Schema | Architect |
| `routes.md` | 页面路由 + 页面功能描述 | Architect |
| `design-system.md` | UI 颜色 / 组件 / 交互规范 | Architect → UIUX |

## 使用规则

- spec 定稿后禁止单方面修改
- 修改流程：提 issue → 调度确认 → 通知所有相关 Agent
- Frontend/Backend/Mobile/MiniProgram 各 Agent 启动时需重读 specs/
