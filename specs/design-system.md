# UI 设计规范（初始版）

> 版本: v1.0
> 最后更新: 2026-05-28
> 适用: Web 前端 (Tailwind CSS) / Flutter 主题 / Taro 主题
> UIUX 后续可在此基础上扩展

---

## 1. 设计原则

1. **内容优先** — 阅读体验第一，装饰为内容服务
2. **简洁干净** — 充足留白，减少视觉噪音
3. **一致性** — 跨三端保持一致的视觉语言
4. **可访问性** — 足够的对比度、可读字号
5. **响应式** — 优先 Mobile First，向上适配桌面

---

## 2. 色彩系统

### 2.1 主色调

| 角色 | 色值 (Light) | 色值 (Dark) | Tailwind | 用途 |
|------|-------------|-------------|----------|------|
| Primary | `#2563EB` (Blue-600) | `#60A5FA` (Blue-400) | `blue-600` / `blue-400` | 主按钮、链接、活跃状态 |
| Primary Hover | `#1D4ED8` (Blue-700) | `#93C5FD` (Blue-300) | `blue-700` / `blue-300` | 悬停状态 |
| Primary Light | `#DBEAFE` (Blue-100) | `#1E3A5F` | `blue-100` | 浅色背景、标签 |

### 2.2 辅助色

| 角色 | 色值 (Light) | 用途 |
|------|-------------|------|
| Success | `#16A34A` (Green-600) | 成功提示、已发布 |
| Warning | `#D97706` (Amber-600) | 警告、草稿状态 |
| Danger | `#DC2626` (Red-600) | 删除、错误提示 |
| Info | `#0891B2` (Cyan-600) | 信息提示 |

### 2.3 中性色

| 角色 | Light | Dark | Tailwind | 用途 |
|------|-------|------|----------|------|
| Background | `#FFFFFF` | `#0F172A` | `white` / `slate-900` | 页面背景 |
| Surface | `#F8FAFC` | `#1E293B` | `slate-50` / `slate-800` | 卡片/面板背景 |
| Surface Hover | `#F1F5F9` | `#334155` | `slate-100` / `slate-700` | 卡片悬浮 |
| Border | `#E2E8F0` | `#475569` | `slate-200` / `slate-600` | 分割线、边框 |
| Text Primary | `#0F172A` | `#F8FAFC` | `slate-900` / `slate-50` | 主标题 |
| Text Secondary | `#475569` | `#94A3B8` | `slate-600` / `slate-400` | 辅助文字 |
| Text Tertiary | `#94A3B8` | `#64748B` | `slate-400` / `slate-500` | 占位符、次要信息 |
| Text Inverse | `#FFFFFF` | `#0F172A` | `white` / `slate-900` | 反色文字 |

---

## 3. 排版

### 3.1 字体栈

```css
/* Web (Tailwind) */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI',
             'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;

/* 代码 */
font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
```

**Flutter:**
```dart
TextStyle(
  fontFamily: 'Noto Sans SC',   // 中文字体
  // 英文使用默认 Roboto
)
```

### 3.2 字号层级

| 层级 | Web (px/rem) | Mobile | 用途 |
|------|-------------|--------|------|
| h1 | 32px / 2rem | 24px | 文章标题 |
| h2 | 24px / 1.5rem | 20px | 页面标题 |
| h3 | 20px / 1.25rem | 18px | 区块标题 |
| h4 | 18px / 1.125rem | 16px | 卡片标题 |
| body-lg | 16px / 1rem | 16px | 正文大号 |
| body | 15px / 0.938rem | 14px | 正文默认 |
| body-sm | 14px / 0.875rem | 13px | 辅助文字 |
| caption | 12px / 0.75rem | 12px | 标签、脚注 |
| small | 10px / 0.625rem | 10px | 徽章数字 |

**Tailwind 配置：**
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontSize: {
        'h1': ['2rem', { lineHeight: '1.4', fontWeight: '700' }],
        'h2': ['1.5rem', { lineHeight: '1.4', fontWeight: '600' }],
        'h3': ['1.25rem', { lineHeight: '1.5', fontWeight: '600' }],
        'h4': ['1.125rem', { lineHeight: '1.5', fontWeight: '600' }],
        'body': ['0.938rem', { lineHeight: '1.75' }],
        'body-sm': ['0.875rem', { lineHeight: '1.6' }],
      }
    }
  }
}
```

### 3.3 行高

| 场景 | 行高 | 说明 |
|------|------|------|
| 标题 | 1.3 - 1.4 | 紧密 |
| 正文 | 1.75 | 宽松，适合阅读 |
| 代码块 | 1.6 | |
| 按钮 | 1 | 单行居中 |

### 3.4 代码样式

| 元素 | 样式 |
|------|------|
| 行内代码 | `bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-pink-600` |
| 代码块 | `bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto text-sm font-mono` |

---

## 4. 间距系统

采用 4px 基准的间距体系：

| Token | Pixels | Tailwind | 场景 |
|-------|--------|----------|------|
| space-0 | 0px | `p-0` / `m-0` | |
| space-1 | 4px | `p-1` | 微间距 |
| space-2 | 8px | `p-2` | 紧凑间距 |
| space-3 | 12px | `p-3` | 元素间距 |
| space-4 | 16px | `p-4` | 默认内边距 |
| space-5 | 20px | `p-5` | 区块间距 |
| space-6 | 24px | `p-6` | 卡片内边距 |
| space-8 | 32px | `p-8` | 大区块间距 |
| space-10 | 40px | `p-10` | 页面段落间距 |
| space-12 | 48px | `p-12` | 页面区域间距 |
| space-16 | 64px | `p-16` | 最大间距 |

**栅格：**
- 内容区域最大宽度：1200px（桌面），居中
- 侧边栏：320px（桌面）
- 文章内容区：720px（适宜阅读宽度）

---

## 5. 组件样式规范

### 5.1 按钮 (Button)

| 变体 | 样式 | 禁用 |
|------|------|------|
| Primary | `bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800` | `opacity-50 cursor-not-allowed` |
| Secondary | `bg-white text-slate-900 border border-slate-300 hover:bg-slate-50` | 同上 |
| Ghost | `text-slate-600 hover:bg-slate-100` | 同上 |
| Danger | `bg-red-600 text-white hover:bg-red-700` | 同上 |

**尺寸：**
- sm: `px-3 py-1.5 text-sm rounded-md`
- md: `px-4 py-2 text-sm rounded-lg`（默认）
- lg: `px-6 py-3 text-base rounded-lg`

**状态：** 加载中显示 spinner，过程不可重复点击

### 5.2 输入框 (Input)

| 元素 | 样式 |
|------|------|
| 默认 | `w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500` |
| 错误 | `border-red-500 focus:ring-red-500` |
| 禁用 | `bg-slate-100 text-slate-400 cursor-not-allowed` |
| 标签 | `block text-sm font-medium text-slate-700 mb-1` |
| 错误提示 | `text-sm text-red-600 mt-1` |

### 5.3 卡片 (Card)

```css
/* 基础卡片 */
.card {
  @apply bg-white rounded-xl border border-slate-200 p-6;
}

/* 卡片悬浮 */
.card:hover {
  @apply shadow-md border-slate-300 transition-shadow;
}

/* 文章卡片 */
.article-card {
  @apply bg-white rounded-xl overflow-hidden border border-slate-200;
}
.article-card:hover {
  @apply shadow-lg -translate-y-0.5 transition-all duration-200;
}
```

### 5.4 标签 (Tag / Badge)

| 变体 | 样式 |
|------|------|
| 默认 | `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600` |
| Primary | `bg-blue-100 text-blue-700` |
| 可点击 | 同上 + `hover:bg-blue-200 cursor-pointer` |

### 5.5 导航 (Navigation)

| 元素 | 样式 |
|------|------|
| 主导航项 | `text-sm font-medium text-slate-600 hover:text-blue-600 px-3 py-2` |
| 活跃导航项 | `text-blue-600 font-semibold` |
| 后台侧边栏项 | `flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg` |
| 后台活跃侧边栏项 | `bg-slate-700 text-white font-medium` |

### 5.6 面包屑 (Breadcrumb)

```css
.breadcrumb {
  @apply flex items-center gap-1 text-sm text-slate-500;
}
.breadcrumb a {
  @apply hover:text-blue-600;
}
.breadcrumb .separator {
  @apply text-slate-300 mx-1;
}
.breadcrumb .current {
  @apply text-slate-900 font-medium;
}
```

### 5.7 分页 (Pagination)

```
[上一页] [1] [2] [3] [...] [10] [下一页]
```

| 元素 | 样式 |
|------|------|
| 页码按钮 | `w-9 h-9 flex items-center justify-center rounded-lg text-sm text-slate-600 hover:bg-slate-100` |
| 当前页 | `bg-blue-600 text-white hover:bg-blue-700` |
| 禁用 | `text-slate-300 cursor-not-allowed` |

### 5.8 加载状态

| 状态 | 说明 |
|------|------|
| Skeleton | 灰色脉冲动画占位（推荐用于文章列表） |
| Spinner | 旋转动画，用于按钮加载/页面刷新 |
| 无限滚动 | 列表底部显示 spinner |
| 空状态 | 居中图标 + "暂无内容" 文案 + 操作引导 |

---

## 6. 文章内容排版

文章正文区域的样式（用于 TipTap 编辑器渲染和前台展示）：

```css
/* 文章正文容器 */
.article-content {
  @apply text-body leading-relaxed text-slate-900;
}

.article-content h2 {
  @apply text-h2 mt-8 mb-4;
}

.article-content h3 {
  @apply text-h3 mt-6 mb-3;
}

.article-content p {
  @apply mb-4;
}

.article-content a {
  @apply text-blue-600 underline hover:text-blue-800;
}

.article-content ul {
  @apply list-disc pl-6 mb-4 space-y-1;
}

.article-content ol {
  @apply list-decimal pl-6 mb-4 space-y-1;
}

.article-content blockquote {
  @apply border-l-4 border-blue-500 pl-4 italic text-slate-600 my-6;
}

.article-content pre {
  @apply bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto my-6 text-sm;
}

.article-content code {
  @apply bg-slate-100 text-pink-600 px-1.5 py-0.5 rounded text-sm font-mono;
}

.article-content pre code {
  @apply bg-transparent text-slate-100 px-0 py-0;
}

.article-content img {
  @apply rounded-lg my-6 max-w-full h-auto;
}

.article-content hr {
  @apply my-8 border-slate-200;
}

.article-content table {
  @apply w-full border-collapse my-6;
}

.article-content th {
  @apply bg-slate-50 text-left px-4 py-2 border border-slate-200 font-semibold;
}

.article-content td {
  @apply px-4 py-2 border border-slate-200;
}
```

---

## 7. 暗色模式

每个组件需同时提供 light 和 dark 样式。

**切换方式：**
- Web: CSS `prefers-color-scheme` + 用户手动切换（localStorage 记录）
- Flutter: ThemeData Brightness
- 小程序: 跟随系统

**关键暗色覆盖：**
```css
.dark .card {
  @apply bg-slate-800 border-slate-700;
}

.dark .article-content {
  @apply text-slate-100;
}

.dark .article-content blockquote {
  @apply text-slate-400;
}
```

---

## 8. 响应式断点

| 断点 | 宽度 | 目标设备 |
|------|------|----------|
| xs | < 640px | 手机 |
| sm | ≥ 640px | 大屏手机 |
| md | ≥ 768px | 平板 |
| lg | ≥ 1024px | 小屏笔记本 |
| xl | ≥ 1280px | 桌面 |
| 2xl | ≥ 1536px | 大屏桌面 |

**Tailwind 配置示例：**
```js
// 内容区域最大宽度
container: {
  center: true,
  padding: '1rem',
  screens: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1200px',  // 最大1200px
  }
}
```

**关键布局变化：**
| 组件 | 移动端 | 桌面端 |
|------|--------|--------|
| 导航 | 汉堡菜单 | 水平导航栏 |
| 文章列表 | 单列卡片 | 列表/网格可切换 |
| 文章详情 | 全宽 | 内容区 720px 居中 |
| 后台布局 | 侧边栏折叠为图标 | 固定侧边栏 240px |
| 首页侧边栏 | 隐藏 | 显示（固定宽度 320px） |

---

## 9. 阴影与圆角

| Token | 阴影值 | 用途 |
|-------|--------|------|
| shadow-sm | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | 卡片边框替代 |
| shadow | `0 1px 3px 0 rgb(0 0 0 / 0.1)` | 普通卡片 |
| shadow-md | `0 4px 6px -1px rgb(0 0 0 / 0.1)` | 悬浮卡片 |
| shadow-lg | `0 10px 15px -3px rgb(0 0 0 / 0.1)` | 模态框 |
| shadow-xl | `0 20px 25px -5px rgb(0 0 0 / 0.1)` | 下拉菜单 |

| Token | 圆角 | 用途 |
|-------|------|------|
| rounded | 4px | 按钮、标签 |
| rounded-md | 6px | 输入框 |
| rounded-lg | 8px | 卡片 |
| rounded-xl | 12px | 大卡片、模态框 |
| rounded-2xl | 16px | 弹窗 |
| rounded-full | 9999px | 头像、胶囊按钮 |

---

## 10. 动画与过渡

### 10.1 持续时间

| Token | 毫秒 | 场景 |
|-------|------|------|
| duration-150 | 150ms | 悬停、焦点 |
| duration-200 | 200ms | 默认过渡 |
| duration-300 | 300ms | 页面切换、面板展开 |
| duration-500 | 500ms | 模态框淡入 |

### 10.2 常用过渡

```css
/* 按钮悬停 */
.btn {
  @apply transition-all duration-150 ease-in-out;
}

/* 卡片悬浮 */
.card {
  @apply transition-all duration-200 ease-out;
}
.card:hover {
  @apply -translate-y-0.5 shadow-md;
}

/* 模态框 */
.modal-overlay {
  @apply transition-opacity duration-300;
}
.modal-content {
  @apply transition-transform duration-300 ease-out;
}
```

---

## 11. 图标

- 使用 **Lucide Icons**（Web 端，与 Tailwind 生态一致）
- Flutter 端使用 `lucide_icons` 包
- 小程序使用 NutUI 内置图标或自定义 SVG
- 图标尺寸统一：16px / 20px / 24px

---

## 12. Tailwind 配置（起手配置）

```js
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A5F',
        }
      },
      fontSize: {
        'h1': ['2rem', { lineHeight: '1.4', fontWeight: '700' }],
        'h2': ['1.5rem', { lineHeight: '1.4', fontWeight: '600' }],
        'h3': ['1.25rem', { lineHeight: '1.5', fontWeight: '600' }],
        'h4': ['1.125rem', { lineHeight: '1.5', fontWeight: '600' }],
        'body': ['0.938rem', { lineHeight: '1.75' }],
        'body-lg': ['1rem', { lineHeight: '1.75' }],
        'body-sm': ['0.875rem', { lineHeight: '1.6' }],
      },
      maxWidth: {
        'content': '720px',
        'page': '1200px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI',
               'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),  // 文章排版
    require('@tailwindcss/forms'),       // 表单样式
  ],
}
export default config
```

---

## 13. Flutter 主题映射

```dart
// mobile/lib/config/theme.dart
import 'package:flutter/material.dart';

class AppTheme {
  static ThemeData light = ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    colorSchemeSeed: const Color(0xFF2563EB), // blue-600
    scaffoldBackgroundColor: const Color(0xFFFFFFFF),
    appBarTheme: const AppBarTheme(
      backgroundColor: Color(0xFFFFFFFF),
      foregroundColor: Color(0xFF0F172A),
      elevation: 0,
    ),
    cardTheme: CardTheme(
      color: const Color(0xFFF8FAFC),
      elevation: 1,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
    ),
    textTheme: const TextTheme(
      headlineLarge: TextStyle(fontSize: 24, fontWeight: FontWeight.w700),
      headlineMedium: TextStyle(fontSize: 20, fontWeight: FontWeight.w600),
      titleLarge: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
      bodyLarge: TextStyle(fontSize: 16, height: 1.75),
      bodyMedium: TextStyle(fontSize: 14, height: 1.6),
      labelSmall: TextStyle(fontSize: 12, height: 1.4),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: const Color(0xFF2563EB),
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
    ),
  );

  static ThemeData dark = ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    colorSchemeSeed: const Color(0xFF60A5FA),
    scaffoldBackgroundColor: const Color(0xFF0F172A),
    // ... 其他样式同 light 但颜色取暗色
  );
}
```
