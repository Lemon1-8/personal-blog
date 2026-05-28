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
        <div className="max-w-page mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Pinned Articles */}
              {pinnedArticles.length > 0 && !loading && (
                <section className="mb-10">
                  <h2 className="text-h4 text-slate-900 mb-4 flex items-center gap-2">
                    <span className="w-1 h-5 bg-blue-600 rounded-full" />
                    置顶文章
                  </h2>
                  <div className="grid gap-4 md:grid-cols-3">
                    {pinnedArticles.map((article) => (
                      <ArticleCard key={article.id} article={article} variant="compact" />
                    ))}
                  </div>
                </section>
              )}

              {/* Recent Articles */}
              <section>
                <h2 className="text-h4 text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-blue-600 rounded-full" />
                  最新文章
                </h2>
                <ArticleList articles={recentArticles} loading={loading} />
                {!loading && page < totalPages && (
                  <div className="mt-6 text-center">
                    <button
                      onClick={loadMore}
                      className="px-6 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      加载更多
                    </button>
                  </div>
                )}
              </section>
            </div>

            {/* Sidebar */}
            <aside className="w-full lg:w-80 shrink-0">
              <div className="sticky top-20 space-y-6">
                {/* Categories */}
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">分类</h3>
                  <div className="space-y-2">
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/categories/${cat.slug}`}
                        className="flex items-center justify-between px-3 py-2 text-sm rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <span className="text-slate-600">{cat.name}</span>
                        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                          {cat.article_count}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Hot Tags */}
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">热门标签</h3>
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
