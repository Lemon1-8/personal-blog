'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, Heart, Bookmark, ChevronLeft, ChevronRight, Share2 } from 'lucide-react'
import type { ArticleListItem } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { Tag } from '@/components/ui/Tag'
import { CategoryBadge } from '@/components/ui/CategoryBadge'
import { Button } from '@/components/ui/Button'

interface ArticleDetailProps {
  article: ArticleListItem
  onLike?: () => void
  onFavorite?: () => void
}

export function ArticleDetail({ article, onLike, onFavorite }: ArticleDetailProps) {
  const [liked, setLiked] = useState(article.is_liked || false)
  const [likesCount, setLikesCount] = useState(article.likes_count)
  const [favorited, setFavorited] = useState(article.is_favorited || false)

  const handleLike = () => {
    setLiked(!liked)
    setLikesCount(liked ? likesCount - 1 : likesCount + 1)
    onLike?.()
  }

  const handleFavorite = () => {
    setFavorited(!favorited)
    onFavorite?.()
  }

  return (
    <article className="max-w-content mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/" className="hover:text-blue-600">首页</Link>
        <span className="text-slate-300">/</span>
        <Link href={`/categories/${article.category.slug}`} className="hover:text-blue-600">
          {article.category.name}
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-900 font-medium">{article.title}</span>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <CategoryBadge name={article.category.name} slug={article.category.slug} />
          {article.is_pinned && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
              置顶
            </span>
          )}
        </div>
        <h1 className="text-h1 text-slate-900 mb-4">{article.title}</h1>
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <span>作者：{article.author.nickname}</span>
          <span>{formatDate(article.published_at)}</span>
          <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{article.views_count}</span>
          <span className="flex items-center gap-1"><Heart className="w-4 h-4" />{likesCount}</span>
        </div>
        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {article.tags.map((tag) => (
              <Tag key={tag.id} name={tag.name} slug={tag.slug} size="md" />
            ))}
          </div>
        )}
      </header>

      {/* Content */}
      <div
        className="article-content"
        dangerouslySetInnerHTML={{ __html: article.content || '' }}
      />

      {/* Actions */}
      <div className="flex items-center justify-center gap-4 my-10 py-6 border-t border-b border-slate-200">
        <Button variant="ghost" onClick={handleLike} className="flex items-center gap-2">
          <Heart className={`w-5 h-5 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
          <span>{likesCount}</span>
        </Button>
        <Button variant="ghost" onClick={handleFavorite} className="flex items-center gap-2">
          <Bookmark className={`w-5 h-5 ${favorited ? 'fill-blue-500 text-blue-500' : ''}`} />
          <span>{favorited ? '已收藏' : '收藏'}</span>
        </Button>
        <Button variant="ghost" className="flex items-center gap-2">
          <Share2 className="w-5 h-5" />
          分享
        </Button>
      </div>

      {/* Prev/Next */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {article.prev_article ? (
          <Link
            href={`/articles/${article.prev_article.slug}`}
            className="flex items-center gap-2 p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
          >
            <ChevronLeft className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500 mb-1">上一篇</p>
              <p className="text-sm font-medium text-slate-900 truncate group-hover:text-blue-600">
                {article.prev_article.title}
              </p>
            </div>
          </Link>
        ) : <div />}
        {article.next_article && (
          <Link
            href={`/articles/${article.next_article.slug}`}
            className="flex items-center gap-2 p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group text-right"
          >
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500 mb-1">下一篇</p>
              <p className="text-sm font-medium text-slate-900 truncate group-hover:text-blue-600">
                {article.next_article.title}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
          </Link>
        )}
      </div>
    </article>
  )
}
