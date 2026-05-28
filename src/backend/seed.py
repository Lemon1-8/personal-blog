"""Seed script: populate blog with sample data."""
import asyncio
import uuid
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import text

from app.models.base import Base
from app.models.user import User
from app.models.article import Article
from app.models.category import Category
from app.models.tag import Tag
from app.models.article_tag import ArticleTag
from app.models.site_setting import SiteSetting
from app.core.security import hash_password as get_password_hash

DATABASE_URL = "postgresql+asyncpg://blog:blog123@localhost:5432/blog_db"

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def seed():
    async with AsyncSessionLocal() as session:
        # Clean existing data
        for table in ["article_tags", "likes", "favorites", "articles", "categories", "tags", "medias", "site_settings", "users"]:
            await session.execute(text(f"DELETE FROM {table}"))
        await session.commit()

        # ── Admin user ──
        admin = User(
            id=uuid.uuid4(),
            username="admin",
            email="admin@example.com",
            hashed_password=get_password_hash("Admin123!"),
            nickname="管理员",
            bio="热爱写代码的独立开发者",
            role="admin",
        )
        session.add(admin)

        # ── Categories ──
        cats = [
            Category(id=uuid.uuid4(), name="技术", slug="tech", description="编程、技术架构相关", order=1),
            Category(id=uuid.uuid4(), name="生活", slug="life", description="生活随笔、思考", order=2),
            Category(id=uuid.uuid4(), name="产品", slug="product", description="产品设计、项目管理", order=3),
            Category(id=uuid.uuid4(), name="AI", slug="ai", description="人工智能、LLM 相关", order=4),
        ]
        session.add_all(cats)
        await session.flush()

        # ── Tags ──
        tags = [
            Tag(id=uuid.uuid4(), name="Python", slug="python"),
            Tag(id=uuid.uuid4(), name="FastAPI", slug="fastapi"),
            Tag(id=uuid.uuid4(), name="Next.js", slug="nextjs"),
            Tag(id=uuid.uuid4(), name="Docker", slug="docker"),
            Tag(id=uuid.uuid4(), name="AI Agent", slug="ai-agent"),
            Tag(id=uuid.uuid4(), name="Flutter", slug="flutter"),
            Tag(id=uuid.uuid4(), name="产品思维", slug="product-mindset"),
            Tag(id=uuid.uuid4(), name="开源", slug="open-source"),
        ]
        session.add_all(tags)
        await session.flush()

        # ── Articles ──
        now = datetime.now(timezone.utc)
        articles_data = [
            {
                "title": "用 FastAPI 构建 RESTful API 的最佳实践",
                "slug": "fastapi-best-practices",
                "summary": "分享我在多个项目中使用 FastAPI 总结出的最佳实践，包括项目结构、依赖注入、错误处理等。",
                "content": "<h2>为什么选择 FastAPI</h2><p>FastAPI 是当今 Python 生态中最受欢迎的现代 Web 框架之一。</p><p>它基于 Starlette 和 Pydantic，具有出色的性能和开发体验。</p><h2>项目结构</h2><p>推荐按功能模块组织目录：</p><pre><code>app/\n├── api/v1/    # 路由\n├── models/    # 数据模型\n├── schemas/   # Pydantic 模型\n├── services/  # 业务逻辑\n├── core/      # 核心工具\n└── utils/     # 辅助函数</code></pre><h2>依赖注入</h2><p>FastAPI 的 Depends 系统让依赖管理变得优雅。</p><blockquote><p>依赖注入不仅仅是获取数据库会话，更是组织业务逻辑的好方式。</p></blockquote><p>通过合理的依赖设计，我们可以轻松实现单元测试和模块替换。</p>",
                "cover_image": "",
                "category": cats[0],
                "tags": [tags[0], tags[1]],
                "status": "published",
                "is_pinned": True,
                "published_at": now,
            },
            {
                "title": "AI 开发团队的架构设计心得",
                "slug": "ai-dev-team-architecture",
                "summary": "如何设计一个多 Agent 协作的 AI 开发团队，从实践中总结出的架构模式。",
                "content": "<h2>背景</h2><p>构建 AI 开发团队的核心不是让每个 Agent 什么都会，而是让每个 Agent 各司其职。</p><h2>关键原则</h2><ul><li><strong>单一职责</strong>：一个 Agent 只做一件事</li><li><strong>契约优先</strong>：先定接口再并行开发</li><li><strong>可测试</strong>：每个模块都必须可独立测试</li></ul><p>采用这种模式后，开发效率提升显著。</p>",
                "category": cats[3],
                "tags": [tags[4], tags[6]],
                "status": "published",
                "is_pinned": True,
                "published_at": datetime(2026, 5, 25, 10, 0, 0, tzinfo=timezone.utc),
            },
            {
                "title": "Docker 化部署 Python 应用的完整指南",
                "slug": "docker-python-deployment",
                "summary": "从零开始，教你如何将 Python 应用容器化并部署到服务器。",
                "content": "<h2>为什么用 Docker</h2><p>Docker 解决了&quot;在我机器上能跑&quot;这个永恒难题。</p><h2>编写 Dockerfile</h2><p>多阶段构建是推荐的实践方式。</p><h2>docker-compose 编排</h2><p>当你的应用依赖数据库、缓存等多个服务时，docker-compose 是最佳选择。</p>",
                "category": cats[0],
                "tags": [tags[3], tags[0]],
                "status": "published",
                "is_pinned": False,
                "published_at": datetime(2026, 5, 20, 14, 30, 0, tzinfo=timezone.utc),
            },
            {
                "title": "从零搭建 Next.js 博客系统",
                "slug": "nextjs-blog-tutorial",
                "summary": "使用 Next.js 14 App Router 搭建一个功能完整的个人博客。",
                "content": "<h2>技术选型</h2><p>Next.js 14 + Tailwind CSS + TypeScript</p><h2>App Router</h2><p>App Router 带来了新的路由模型和服务端组件能力。</p><h2>后台管理</h2><p>集成 TipTap 编辑器实现文章创作体验。</p>",
                "category": cats[0],
                "tags": [tags[2], tags[7]],
                "status": "published",
                "is_pinned": False,
                "published_at": datetime(2026, 5, 15, 9, 0, 0, tzinfo=timezone.utc),
            },
            {
                "title": "产品经理的 AI 工具箱",
                "slug": "pm-ai-tools",
                "summary": "推荐 10 款提升产品经理工作效率的 AI 工具，涵盖需求分析到原型设计。",
                "content": "<h2>需求分析</h2><p>AI 可以帮助产品经理更快地进行需求整理和用户研究。</p><h2>原型设计</h2><p>从文字描述到可交互原型，AI 正在改变设计工作流。</p><h2>数据分析</h2><p>用自然语言查询数据，AI 让分析变得更直观。</p>",
                "category": cats[2],
                "tags": [tags[4], tags[6]],
                "status": "published",
                "is_pinned": False,
                "published_at": datetime(2026, 5, 10, 16, 0, 0, tzinfo=timezone.utc),
            },
            {
                "title": "Flutter vs React Native：2026 年怎么选",
                "slug": "flutter-vs-rn-2026",
                "summary": "从开发效率、性能、生态三个维度对比两大跨平台框架。",
                "content": "<h2>性能对比</h2><p>Flutter 的 Skia 引擎在渲染性能上仍有优势。</p><h2>开发效率</h2><p>React Native 的生态更成熟，热更新更方便。</p><h2>如何选择</h2><p>看团队背景和项目需求，没有绝对的赢家。</p>",
                "category": cats[0],
                "tags": [tags[5]],
                "status": "published",
                "is_pinned": False,
                "published_at": datetime(2026, 5, 5, 11, 0, 0, tzinfo=timezone.utc),
            },
            {
                "title": "周末去爬山了",
                "slug": "weekend-hiking",
                "summary": "记录一次周末爬山的体验和感悟。",
                "content": "<p>上周六和朋友一起去爬了梧桐山，早上六点出发，七点开始登山。</p><p>山顶的风景确实值得早起。看着远处的城市轮廓，突然觉得平时纠结的事情其实没那么重要。</p><p>建议大家多出去走走，远离屏幕的感觉真的很好。</p>",
                "category": cats[1],
                "tags": [],
                "status": "published",
                "is_pinned": False,
                "published_at": datetime(2026, 4, 28, 8, 0, 0, tzinfo=timezone.utc),
            },
        ]

        articles = []
        for a in articles_data:
            article = Article(
                id=uuid.uuid4(),
                title=a["title"],
                slug=a["slug"],
                summary=a["summary"],
                content=a["content"],
                content_type="html",
                author_id=admin.id,
                category_id=a["category"].id,
                status=a["status"],
                is_pinned=a["is_pinned"],
                published_at=a["published_at"],
                views_count=hash(a["slug"]) % 2000 + 100,
                likes_count=hash(a["slug"][:3]) % 100,
            )
            session.add(article)
            await session.flush()

            for tag in a["tags"]:
                session.add(ArticleTag(article_id=article.id, tag_id=tag.id))

            articles.append(article)

        # ── Site Settings ──
        settings = SiteSetting(
            id=uuid.uuid4(),
            site_name="韩老魔的博客",
            site_description="记录技术、产品与生活",
            social_github="https://github.com/old-demon-han",
            social_twitter="https://twitter.com/old_demon_han",
        )
        session.add(settings)

        await session.commit()
        print(f"✅ Seed complete!")
        print(f"   Users: 1 (admin / Admin123!)")
        print(f"   Categories: {len(cats)}")
        print(f"   Tags: {len(tags)}")
        print(f"   Articles: {len(articles)}")


asyncio.run(seed())
