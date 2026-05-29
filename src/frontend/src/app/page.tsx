'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ArticleCard } from '@/components/article/ArticleCard'
import { ArticleList } from '@/components/article/ArticleList'
import { Tag } from '@/components/ui/Tag'
import { Loading } from '@/components/ui/Loading'
import { getPinned, getArticles, getCategories, getHotTags } from '@/lib/api'
import type { ArticleListItem, Category, Tag as TagType } from '@/lib/api'
import Link from 'next/link'

export default function HomePage() {
  const [pinnedArticles, setPinnedArticles] = useState<ArticleListItem[]>([])
  const [recentArticles, setRecentArticles] = useState<ArticleListItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [hotTags, setHotTags] = useState<TagType[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    async function loadData() {
      try {
        const [pinnedRes, articlesRes, catsRes, tagsRes] = await Promise.all([
          getPinned(),
          getArticles({ page: 1, page_size: 10 }),
          getCategories(),
          getHotTags(10),
        ])
        setPinnedArticles(pinnedRes.data)
        setRecentArticles(articlesRes.data.items)
        setTotalPages(articlesRes.data.total_pages)
        setCategories(catsRes.data)
        setHotTags(tagsRes.data)
      } catch (err) {
        console.error('Failed to load homepage data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const loadMore = async () => {
    const nextPage = page + 1
    const res = await getArticles({ page: nextPage, page_size: 10 })
    setRecentArticles((prev) => [...prev, ...res.data.items])
    setPage(nextPage)
    setTotalPages(res.data.total_pages)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-page mx-auto px-6 py-10">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Hero area — editorial treatment */}
              {!loading && (
                <div className="mb-12">
                  <p className="text-caption uppercase tracking-[0.2em] text-ink-400 mb-3 font-medium">
                    个人博客
                  </p>
                  <h1 className="font-serif text-display text-ink-900 mb-3">
                    技术 · 生活 · 随笔
                  </h1>
                  <p className="text-body-lg text-ink-500 max-w-lg leading-relaxed">
                    记录思考与创造的过程。写代码、读好书、探索世界。
                  </p>
                </div>
              )}

              {/* Pinned Articles */}
              {pinnedArticles.length > 0 && !loading && (
                <section className="mb-12">
                  <div className="flex items-center gap-3 mb-5">
                    <h2 className="text-xs uppercase tracking-widest text-ink-400 font-semibold">
                      置顶
                    </h2>
                    <span className="flex-1 h-px bg-ink-200" />
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    {pinnedArticles.map((article) => (
                      <ArticleCard key={article.id} article={article} variant="compact" />
                    ))}
                  </div>
                </section>
              )}

              {/* Recent Articles */}
              <section>
                <div className="flex items-center gap-3 mb-5">
                  <h2 className="text-xs uppercase tracking-widest text-ink-400 font-semibold">
                    最新文章
                  </h2>
                  <span className="flex-1 h-px bg-ink-200" />
                </div>
                <ArticleList articles={recentArticles} loading={loading} />
                {!loading && page < totalPages && (
                  <div className="mt-8 text-center">
                    <button
                      onClick={loadMore}
                      className="px-8 py-2.5 text-sm font-medium text-ink-600 border border-ink-300 hover:bg-ink-100 hover:text-ink-800 transition-colors duration-200"
                    >
                      加载更多
                    </button>
                  </div>
                )}
              </section>
            </div>

            {/* Sidebar */}
            <aside className="w-full lg:w-72 shrink-0">
              <div className="sticky top-24 space-y-8">
                {/* Categories */}
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-ink-400 font-semibold mb-4">
                    分类
                  </h3>
                  <div className="border border-ink-200 bg-white">
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/categories/${cat.slug}`}
                        className="flex items-center justify-between px-4 py-3 text-sm hover:bg-ink-50 transition-colors border-b border-ink-100 last:border-b-0"
                      >
                        <span className="text-ink-600">{cat.name}</span>
                        <span className="text-xs text-ink-400 font-mono">{cat.article_count}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Hot Tags */}
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-ink-400 font-semibold mb-4">
                    热门标签
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {hotTags.map((tag) => (
                      <Tag key={tag.id} name={tag.name} slug={tag.slug} variant="primary" />
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
