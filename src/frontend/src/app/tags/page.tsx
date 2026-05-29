'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Loading } from '@/components/ui/Loading'
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

  const getOpacity = (count: number): string => {
    const ratio = (count - minCount) / (maxCount - minCount || 1)
    if (ratio > 0.75) return 'text-ink-700'
    if (ratio > 0.5) return 'text-ink-600'
    if (ratio > 0.25) return 'text-ink-500'
    return 'text-ink-400'
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-page mx-auto px-6 py-10">
          <p className="text-caption uppercase tracking-[0.2em] text-ink-400 mb-2 font-medium">
            标签
          </p>
          <h1 className="font-serif text-display-sm text-ink-900 mb-10">
            标签云
          </h1>
          {loading ? (
            <Loading />
          ) : tags.length === 0 ? (
            <p className="text-ink-400 font-serif italic">暂无标签</p>
          ) : (
            <div className="bg-white border border-ink-200 p-10">
              <div className="flex flex-wrap items-baseline gap-x-5 gap-y-3">
                {tags
                  .sort((a, b) => b.article_count - a.article_count)
                  .map((tag) => (
                    <Link
                      key={tag.id}
                      href={`/tags/${tag.slug}`}
                      className={`${getSize(tag.article_count)} ${getOpacity(tag.article_count)} font-medium hover:text-vermilion-600 transition-colors duration-200`}
                    >
                      {tag.name}
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
