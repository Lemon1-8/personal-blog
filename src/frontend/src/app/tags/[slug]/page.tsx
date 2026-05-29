'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ArticleList } from '@/components/article/ArticleList'
import { Pagination } from '@/components/ui/Pagination'
import { Loading } from '@/components/ui/Loading'
import { getArticles, getTags } from '@/lib/api'
import type { ArticleListItem, Tag as TagType } from '@/lib/api'

export default function TagArticlesPage() {
  const params = useParams()
  const slug = params.slug as string
  const [tag, setTag] = useState<TagType | null>(null)
  const [articles, setArticles] = useState<ArticleListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    async function load() {
      try {
        const [tagsRes, artRes] = await Promise.all([
          getTags(),
          getArticles({ page, page_size: 12, tag_slug: slug }),
        ])
        const foundTag = tagsRes.data.find((t) => t.slug === slug)
        if (foundTag) setTag(foundTag)
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
          {tag && (
            <div className="mb-10">
              <p className="text-caption uppercase tracking-[0.2em] text-ink-400 mb-2 font-medium">
                标签
              </p>
              <h1 className="font-serif text-display-sm text-ink-900 mb-2">
                #{tag.name}
              </h1>
              <p className="text-sm text-ink-500 font-mono">{tag.article_count} 篇文章</p>
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
