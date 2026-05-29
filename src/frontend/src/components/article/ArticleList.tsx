'use client'

import { ArticleCard } from './ArticleCard'
import { SkeletonList } from '@/components/ui/Loading'
import type { ArticleListItem } from '@/lib/api'

interface ArticleListProps {
  articles: ArticleListItem[]
  loading?: boolean
  variant?: 'default' | 'compact'
  emptyText?: string
}

export function ArticleList({
  articles,
  loading = false,
  variant = 'default',
  emptyText = '暂无内容',
}: ArticleListProps) {
  if (loading) {
    return <SkeletonList count={5} />
  }

  if (!articles || articles.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-ink-400 font-serif text-lg italic">{emptyText}</p>
        <div className="ornament mt-6">✽</div>
      </div>
    )
  }

  return (
    <div className={variant === 'default' ? 'space-y-4' : 'grid gap-4 grid-cols-1 md:grid-cols-2'}>
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} variant={variant} />
      ))}
    </div>
  )
}
