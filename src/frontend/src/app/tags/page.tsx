'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Loading } from '@/components/ui/Loading'
import { Tag } from '@/components/ui/Tag'
import { getTags } from '@/lib/api'
import type { Tag as TagType } from '@/lib/api'

export default function TagsPage() {
  const [tags, setTags] = useState<TagType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTags()
      .then((res) => setTags(res.data))
      .finally(() => setLoading(false))
  }, [])

  const maxCount = Math.max(...tags.map((t) => t.article_count), 1)
  const minCount = Math.min(...tags.map((t) => t.article_count), 1)

  const getSize = (count: number): string => {
    const ratio = (count - minCount) / (maxCount - minCount || 1)
    if (ratio > 0.75) return 'text-lg'
    if (ratio > 0.5) return 'text-base'
    if (ratio > 0.25) return 'text-sm'
    return 'text-xs'
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-page mx-auto px-4 py-8">
          <h1 className="text-h2 text-slate-900 mb-8">标签</h1>
          {loading ? (
            <Loading />
          ) : tags.length === 0 ? (
            <p className="text-slate-400">暂无标签</p>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-8">
              <div className="flex flex-wrap items-center gap-3">
                {tags
                  .sort((a, b) => b.article_count - a.article_count)
                  .map((tag) => (
                    <Link
                      key={tag.id}
                      href={`/tags/${tag.slug}`}
                      className={`${getSize(tag.article_count)} font-medium text-slate-600 hover:text-blue-600 transition-colors px-2 py-1 rounded-lg hover:bg-blue-50`}
                    >
                      {tag.name}
                      <span className="ml-1 text-xs text-slate-400">({tag.article_count})</span>
                    </Link>
                  ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
