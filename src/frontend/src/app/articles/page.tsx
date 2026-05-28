'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ArticleList } from '@/components/article/ArticleList'
import { Pagination } from '@/components/ui/Pagination'
import { Tag } from '@/components/ui/Tag'
import { getArticles, getCategories, getTags } from '@/lib/api'
import type { ArticleListItem, Category, Tag as TagType } from '@/lib/api'
import { X } from 'lucide-react'
import Link from 'next/link'

export default function ArticlesPage() {
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
        <div className="max-w-page mx-auto px-4 py-8">
          {/* Title */}
          <div className="mb-6">
            <h1 className="text-h2 text-slate-900">文章</h1>
            {currentCategory && (
              <p className="text-sm text-slate-500 mt-1">分类：{currentCategory.name}</p>
            )}
            {currentTag && (
              <p className="text-sm text-slate-500 mt-1">标签：{currentTag.name}</p>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {(categorySlug || tagSlug) && (
              <Link
                href="/articles"
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
              >
                <X className="w-3 h-3" />
                清除筛选
              </Link>
            )}
            <div className="flex-1" />
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                列表
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                网格
              </button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Link
              href="/articles"
              className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                !categorySlug && !tagSlug
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              全部
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/articles?category=${cat.slug}`}
                className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                  categorySlug === cat.slug
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>

          {/* Articles */}
          <ArticleList articles={articles} loading={loading} variant={viewMode === 'grid' ? 'compact' : 'default'} />

          {/* Pagination */}
          <div className="mt-8">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
