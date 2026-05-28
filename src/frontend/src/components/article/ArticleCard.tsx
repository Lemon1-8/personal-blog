'use client'

import Link from 'next/link'
import { Eye, Heart, MessageSquare, Bookmark } from 'lucide-react'
import type { ArticleListItem } from '@/lib/api'
import { formatDate, truncate } from '@/lib/utils'
import { Tag } from '@/components/ui/Tag'
import { CategoryBadge } from '@/components/ui/CategoryBadge'

interface ArticleCardProps {
  article: ArticleListItem
  variant?: 'default' | 'compact'
}

export function ArticleCard({ article, variant = 'default' }: ArticleCardProps) {
  if (variant === 'compact') {
    return (
      <Link
        href={`/articles/${article.slug}`}
        className="block bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group"
      >
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <CategoryBadge name={article.category.name} slug={article.category.slug} />
              {article.is_pinned && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                  置顶
                </span>
              )}
            </div>
            <h3 className="text-base font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
              {article.title}
            </h3>
            <p className="text-sm text-slate-500 mt-1 line-clamp-2">{article.summary}</p>
            <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
              <span>{formatDate(article.published_at)}</span>
              <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{article.views_count}</span>
              <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{article.likes_count}</span>
            </div>
            {article.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {article.tags.slice(0, 3).map((tag) => (
                  <Tag key={tag.id} name={tag.name} slug={tag.slug} size="sm" />
                ))}
              </div>
            )}
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/articles/${article.slug}`}
      className="block bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group"
    >
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <CategoryBadge name={article.category.name} slug={article.category.slug} />
          {article.is_pinned && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
              置顶
            </span>
          )}
        </div>
        <h3 className="text-xl font-semibold text-slate-900 group-hover:text-blue-600 transition-colors mb-2">
          {article.title}
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed mb-4 line-clamp-2">
          {truncate(article.summary, 200)}
        </p>
        <div className="flex items-center gap-4 text-sm text-slate-400 mb-3">
          <span className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {article.views_count}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="w-4 h-4" />
            {article.likes_count}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-4 h-4" />
            {article.comment_count}
          </span>
          <span className="flex items-center gap-1">
            <Bookmark className="w-4 h-4" />
            {article.is_favorited ? '已收藏' : '收藏'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">{formatDate(article.published_at)}</span>
          </div>
          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {article.tags.slice(0, 2).map((tag) => (
                <Tag key={tag.id} name={tag.name} slug={tag.slug} size="sm" />
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
