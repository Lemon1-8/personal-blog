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
        <div className="flex-1 flex flex-col items-center justify-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">文章未找到</h2>
          <p className="text-slate-500 mb-4">抱歉，该文章不存在或已被删除。</p>
          <Link
            href="/articles"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
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
      <main className="flex-1 py-8 px-4">
        <ArticleDetail article={article} />
      </main>
      <Footer />
    </div>
  )
}
