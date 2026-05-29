'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ArticleList } from '@/components/article/ArticleList'
import { Pagination } from '@/components/ui/Pagination'
import { Loading } from '@/components/ui/Loading'
import { getCategory, getArticles } from '@/lib/api'
import type { ArticleListItem, Category } from '@/lib/api'

export default function CategoryArticlesPage() {
  const params = useParams()
  const slug = params.slug as string
  const [category, setCategory] = useState<Category | null>(null)
  const [articles, setArticles] = useState<ArticleListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    async function load() {
      try {
        const [catRes, artRes] = await Promise.all([
          getCategory(slug),
          getArticles({ page, page_size: 12, category_slug: slug }),
        ])
        if (catRes.code === 0) setCategory(catRes.data)
        setArticles(artRes.data.items)
        setTotalPages(artRes.data.total_pages)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug, page])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-page mx-auto px-6 py-10">
          {category && (
            <div className="mb-10">
              <p className="text-caption uppercase tracking-[0.2em] text-ink-400 mb-2 font-medium">
                分类
              </p>
              <h1 className="font-serif text-display-sm text-ink-900 mb-3">{category.name}</h1>
              {category.description && (
                <p className="text-sm text-ink-500">{category.description}</p>
              )}
            </div>
          )}
          {loading ? (
            <Loading />
          ) : (
            <>
              <ArticleList articles={articles} loading={loading} />
              <div className="mt-10">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
