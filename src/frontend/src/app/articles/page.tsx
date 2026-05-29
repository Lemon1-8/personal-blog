'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ArticleList } from '@/components/article/ArticleList'
import { Pagination } from '@/components/ui/Pagination'
import { Loading } from '@/components/ui/Loading'
import { getArticles, getCategories, getTags } from '@/lib/api'
import type { ArticleListItem, Category, Tag as TagType } from '@/lib/api'
import { X } from 'lucide-react'
import Link from 'next/link'

function ArticlesContent() {
  const searchParams = useSearchParams()
  const [articles, setArticles] = useState<ArticleListItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [allTags, setAllTags] = useState<TagType[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  const categorySlug = searchParams.get('category') || ''
  const tagSlug = searchParams.get('tag') || ''
  const sort = searchParams.get('sort') || 'created_at_desc'

  const loadArticles = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getArticles({
        page,
        page_size: 12,
        category_slug: categorySlug,
        tag_slug: tagSlug,
        sort,
      })
      setArticles(res.data.items)
      setTotalPages(res.data.total_pages)
    } catch (err) {
      console.error('Failed to load articles:', err)
    } finally {
      setLoading(false)
    }
  }, [page, categorySlug, tagSlug, sort])

  useEffect(() => {
    loadArticles()
  }, [loadArticles])

  useEffect(() => {
    getCategories().then((res) => setCategories(res.data))
    getTags().then((res) => setAllTags(res.data))
  }, [])

  const currentCategory = categories.find((c) => c.slug === categorySlug)
  const currentTag = allTags.find((t) => t.slug === tagSlug)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-page mx-auto px-6 py-10">
          {/* Title */}
          <div className="mb-8">
            <p className="text-caption uppercase tracking-[0.2em] text-ink-400 mb-2 font-medium">
              文章
            </p>
            <h1 className="font-serif text-display-sm text-ink-900">
              全部文章
            </h1>
            {currentCategory && (
              <p className="text-sm text-ink-500 mt-2">分类：{currentCategory.name}</p>
            )}
            {currentTag && (
              <p className="text-sm text-ink-500 mt-1">标签：{currentTag.name}</p>
            )}
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3 mb-8 pb-6 border-b border-ink-200">
            {(categorySlug || tagSlug) && (
              <Link
                href="/articles"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-vermilion-50 text-vermilion-700 border border-vermilion-200 hover:bg-vermilion-100 transition-colors"
              >
                <X className="w-3 h-3" />
                清除筛选
              </Link>
            )}
            <div className="flex-1" />
            <div className="flex items-center border border-ink-200 bg-white">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 text-xs transition-colors ${
                  viewMode === 'list' ? 'bg-ink-800 text-ink-50' : 'text-ink-500 hover:text-ink-700'
                }`}
              >
                列表
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 text-xs transition-colors ${
                  viewMode === 'grid' ? 'bg-ink-800 text-ink-50' : 'text-ink-500 hover:text-ink-700'
                }`}
              >
                网格
              </button>
            </div>
          </div>

          {/* Category filter pills */}
          <div className="flex flex-wrap gap-2 mb-8">
            <Link
              href="/articles"
              className={`px-3 py-1.5 text-xs border transition-colors ${
                !categorySlug && !tagSlug
                  ? 'bg-ink-800 text-ink-50 border-ink-800'
                  : 'bg-white text-ink-500 border-ink-200 hover:border-ink-300 hover:text-ink-700'
              }`}
            >
              全部
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/articles?category=${cat.slug}`}
                className={`px-3 py-1.5 text-xs border transition-colors ${
                  categorySlug === cat.slug
                    ? 'bg-ink-800 text-ink-50 border-ink-800'
                    : 'bg-white text-ink-500 border-ink-200 hover:border-ink-300 hover:text-ink-700'
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>

          {/* Articles */}
          <ArticleList articles={articles} loading={loading} variant={viewMode === 'grid' ? 'compact' : 'default'} />

          {/* Pagination */}
          <div className="mt-10">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function ArticlesPage() {
  return (
    <Suspense fallback={<Loading size="lg" text="加载中..." />}>
      <ArticlesContent />
    </Suspense>
  )
}
