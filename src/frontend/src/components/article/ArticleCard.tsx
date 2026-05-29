'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, Heart, Bookmark } from 'lucide-react'
import type { ArticleListItem } from '@/lib/api'
import { toggleFavorite } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { Tag } from '@/components/ui/Tag'
import { CategoryBadge } from '@/components/ui/CategoryBadge'
import { PinnedBadge } from '@/components/ui/PinnedBadge'

interface ArticleCardProps {
  article: ArticleListItem
  variant?: 'default' | 'compact'
}

export function ArticleCard({ article, variant = 'default' }: ArticleCardProps) {
  const [favorited, setFavorited] = useState(article.is_favorited || false)

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const prev = favorited
    setFavorited(!prev)
    try {
      const res = await toggleFavorite(article.id)
      if (res.code === 0) {
        setFavorited(res.data.is_favorited)
      } else {
        setFavorited(prev)
      }
    } catch {
      setFavorited(prev)
    }
  }

  if (variant === 'compact') {
    return (
      <Link
        href={`/articles/${article.slug}`}
        className="group block bg-white border border-ink-200 p-5 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300"
      >
        <div className="flex items-center gap-2 mb-2">
          <CategoryBadge name={article.category.name} slug={article.category.slug} />
          {article.is_pinned && <PinnedBadge />}
        </div>
        <h3 className="font-serif text-lg font-semibold text-ink-900 group-hover:text-vermilion-700 transition-colors line-clamp-1 mb-2">
          {article.title}
        </h3>
        <p className="text-sm text-ink-500 line-clamp-2 leading-relaxed">{article.summary}</p>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-3 text-xs text-ink-400 font-mono">
            <span>{formatDate(article.published_at)}</span>
            <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{article.views_count}</span>
            <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{article.likes_count}</span>
          </div>
          <button
            onClick={handleFavorite}
            className={`p-1 transition-colors ${favorited ? 'text-amber-500' : 'text-ink-300 hover:text-amber-500'}`}
            title={favorited ? '取消收藏' : '收藏'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${favorited ? 'fill-amber-500' : ''}`} />
          </button>
        </div>
        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {article.tags.slice(0, 3).map((tag) => (
              <Tag key={tag.id} name={tag.name} slug={tag.slug} size="sm" />
            ))}
          </div>
        )}
      </Link>
    )
  }

  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group block bg-white border border-ink-200 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <CategoryBadge name={article.category.name} slug={article.category.slug} />
          {article.is_pinned && <PinnedBadge />}
        </div>
        <h3 className="font-serif text-h2 text-ink-900 group-hover:text-vermilion-700 transition-colors mb-3">
          {article.title}
        </h3>
        <p className="text-sm text-ink-500 leading-relaxed mb-5 line-clamp-2">
          {article.summary}
        </p>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4 text-ink-400 font-mono">
            <span>{formatDate(article.published_at)}</span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />{article.views_count}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5" />{article.likes_count}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {article.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 justify-end">
                {article.tags.slice(0, 2).map((tag) => (
                  <Tag key={tag.id} name={tag.name} slug={tag.slug} size="sm" />
                ))}
              </div>
            )}
            <button
              onClick={handleFavorite}
              className={`p-1 transition-colors ${favorited ? 'text-amber-500' : 'text-ink-300 hover:text-amber-500'}`}
              title={favorited ? '取消收藏' : '收藏'}
            >
              <Bookmark className={`w-4 h-4 ${favorited ? 'fill-amber-500' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
