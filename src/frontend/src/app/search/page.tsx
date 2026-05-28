'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ArticleList } from '@/components/article/ArticleList'
import { Pagination } from '@/components/ui/Pagination'
import { getArticles, getHotTags } from '@/lib/api'
import type { ArticleListItem, Tag as TagType } from '@/lib/api'
import { Search, X } from 'lucide-react'

export default function SearchPage() {
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

  const handleTagClick = (tagSlug: string) => {
    router.push(`/articles?tag=${tagSlug}`)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    doSearch(query, newPage)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-page mx-auto px-4 py-8">
          {/* Search Input */}
          <div className="max-w-2xl mx-auto mb-8">
            <form onSubmit={handleSubmit}>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="搜索文章标题或摘要..."
                  className="w-full pl-12 pr-12 py-3 border border-slate-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => setSearchInput('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Hot Tags */}
          {!searched && hotTags.length > 0 && (
            <div className="max-w-2xl mx-auto mb-8">
              <h3 className="text-sm font-medium text-slate-700 mb-3">热门标签</h3>
              <div className="flex flex-wrap gap-2">
                {hotTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => handleTagClick(tag.slug)}
                    className="px-3 py-1.5 text-sm bg-slate-100 text-slate-600 rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors"
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {searched && (
            <>
              <div className="mb-4">
                <p className="text-sm text-slate-500">
                  {articles.length > 0
                    ? `找到 ${articles.length} 篇与"${query}"相关的文章`
                    : `未找到与"${query}"相关的内容`}
                </p>
              </div>
              <ArticleList articles={articles} loading={loading} emptyText={`未找到与"${query}"相关的内容`} />
              {totalPages > 1 && (
                <div className="mt-8">
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
