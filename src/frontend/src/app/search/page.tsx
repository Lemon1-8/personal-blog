'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ArticleList } from '@/components/article/ArticleList'
import { Pagination } from '@/components/ui/Pagination'
import { Loading } from '@/components/ui/Loading'
import { getArticles, getHotTags } from '@/lib/api'
import type { ArticleListItem, Tag as TagType } from '@/lib/api'
import { Search, X } from 'lucide-react'

function SearchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [searchInput, setSearchInput] = useState(query)
  const [articles, setArticles] = useState<ArticleListItem[]>([])
  const [hotTags, setHotTags] = useState<TagType[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searched, setSearched] = useState(false)

  const doSearch = useCallback(async (keyword: string, pageNum: number = 1) => {
    if (!keyword.trim()) return
    setLoading(true)
    setSearched(true)
    try {
      const res = await getArticles({ keyword: keyword, page: pageNum, page_size: 12 })
      setArticles(res.data.items)
      setTotalPages(res.data.total_pages)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (query) {
      setSearchInput(query)
      doSearch(query, 1)
    }
    getHotTags(10).then((res) => setHotTags(res.data))
  }, [query, doSearch])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`)
    }
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    doSearch(query, newPage)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-page mx-auto px-6 py-10">
          {/* Search Input */}
          <div className="max-w-2xl mx-auto mb-10">
            <form onSubmit={handleSubmit}>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="搜索文章..."
                  className="w-full pl-12 pr-12 py-3 bg-white border border-ink-200 text-base focus:outline-none focus:border-vermilion-300 focus:ring-1 focus:ring-vermilion-300 placeholder:text-ink-400"
                  autoFocus
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => setSearchInput('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Hot Tags */}
          {!searched && hotTags.length > 0 && (
            <div className="max-w-2xl mx-auto mb-10">
              <h3 className="text-xs uppercase tracking-widest text-ink-400 font-semibold mb-4">
                热门标签
              </h3>
              <div className="flex flex-wrap gap-2">
                {hotTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => router.push(`/articles?tag=${tag.slug}`)}
                    className="px-3 py-1.5 text-sm bg-ink-100 text-ink-500 hover:bg-vermilion-50 hover:text-vermilion-700 transition-colors"
                  >
                    #{tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {searched && (
            <>
              <div className="mb-6">
                <p className="text-sm text-ink-500">
                  {articles.length > 0
                    ? `找到 ${articles.length} 篇与「${query}」相关的文章`
                    : `未找到与「${query}」相关的内容`}
                </p>
              </div>
              <ArticleList articles={articles} loading={loading} emptyText={`未找到与「${query}」相关的内容`} />
              {totalPages > 1 && (
                <div className="mt-10">
                  <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<Loading size="lg" text="加载中..." />}>
      <SearchContent />
    </Suspense>
  )
}
