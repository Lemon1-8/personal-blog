'use client'

import { useState, useEffect, Suspense } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ArticleList } from '@/components/article/ArticleList'
import { Pagination } from '@/components/ui/Pagination'
import { Loading } from '@/components/ui/Loading'
import { getFavorites } from '@/lib/api'
import type { ArticleListItem } from '@/lib/api'
import { Bookmark } from 'lucide-react'

function FavoritesContent() {
  const [articles, setArticles] = useState<ArticleListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const load = async (p: number) => {
    setLoading(true)
    try {
      const res = await getFavorites({ page: p, page_size: 12 })
      setArticles(res.data.items)
      setTotalPages(res.data.total_pages)
    } catch {
      // not logged in or error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(page)
  }, [page])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-page mx-auto px-6 py-10">
          <p className="text-caption uppercase tracking-[0.2em] text-ink-400 mb-2 font-medium">
            收藏
          </p>
          <h1 className="font-serif text-display-sm text-ink-900 mb-10 flex items-center gap-3">
            <Bookmark className="w-6 h-6 text-amber-500" />
            我的收藏
          </h1>

          <ArticleList
            articles={articles}
            loading={loading}
            emptyText="还没有收藏任何文章"
          />

          {totalPages > 1 && (
            <div className="mt-10">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function FavoritesPage() {
  return (
    <Suspense fallback={<Loading size="lg" text="加载中..." />}>
      <FavoritesContent />
    </Suspense>
  )
}
