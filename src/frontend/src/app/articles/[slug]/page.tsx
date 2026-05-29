'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ArticleDetail } from '@/components/article/ArticleDetail'
import { Loading } from '@/components/ui/Loading'
import { getArticle } from '@/lib/api'
import type { ArticleListItem } from '@/lib/api'
import Link from 'next/link'

export default function ArticleDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const [article, setArticle] = useState<ArticleListItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const res = await getArticle(slug)
        if (res.code === 0 && res.data) {
          setArticle(res.data)
        } else {
          setError(true)
        }
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <Loading size="lg" text="加载文章中..." className="flex-1" />
        <Footer />
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <h2 className="font-serif text-h2 text-ink-900 mb-2">文章未找到</h2>
          <p className="text-ink-500 mb-6">抱歉，该文章不存在或已被删除。</p>
          <Link
            href="/articles"
            className="px-5 py-2 text-sm font-medium text-ink-50 bg-ink-800 hover:bg-ink-900 transition-colors"
          >
            返回文章列表
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-10 px-6">
        <ArticleDetail article={article} />
      </main>
      <Footer />
    </div>
  )
}
