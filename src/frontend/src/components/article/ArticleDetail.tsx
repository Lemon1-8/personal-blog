'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Eye, Heart, Bookmark, ChevronLeft, ChevronRight, Share2 } from 'lucide-react'
import { marked } from 'marked'
import type { ArticleListItem } from '@/lib/api'
import { toggleLike, toggleFavorite } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { Tag } from '@/components/ui/Tag'
import { CategoryBadge } from '@/components/ui/CategoryBadge'
import { PinnedBadge } from '@/components/ui/PinnedBadge'
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

  const handleLike = async () => {
    const prevLiked = liked
    const prevCount = likesCount
    setLiked(!prevLiked)
    setLikesCount(prevLiked ? prevCount - 1 : prevCount + 1)
    onLike?.()
    try {
      await toggleLike(article.id)
    } catch {
      setLiked(prevLiked)
      setLikesCount(prevCount)
    }
  }

  const handleFavorite = async () => {
    const prev = favorited
    setFavorited(!prev)
    onFavorite?.()
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

  const contentHtml = useMemo(() => {
    if (!article.content) return ''
    if (article.content_type === 'markdown') {
      const result = marked.parse(article.content)
      return typeof result === 'string' ? result : ''
    }
    return article.content
  }, [article.content, article.content_type])

  return (
    <article className="max-w-content mx-auto">
      <nav className="flex items-center gap-2 text-sm text-ink-400 mb-8 font-mono">
        <Link href="/" className="hover:text-vermilion-600 transition-colors">首页</Link>
        <span className="text-ink-300">/</span>
        <Link href={`/categories/${article.category.slug}`} className="hover:text-vermilion-600 transition-colors">
          {article.category.name}
        </Link>
        <span className="text-ink-300">/</span>
        <span className="text-ink-600">{article.title}</span>
      </nav>

      <header className="mb-10">
        <div className="flex items-center gap-3 mb-5">
          <CategoryBadge name={article.category.name} slug={article.category.slug} />
          {article.is_pinned && (
            <PinnedBadge />
          )}
        </div>
        <h1 className="font-serif text-display-sm text-ink-900 mb-6 leading-tight">
          {article.title}
        </h1>
        <div className="flex items-center gap-5 text-sm text-ink-500">
          <span className="font-medium text-ink-700">{article.author.nickname}</span>
          <span className="text-ink-300">·</span>
          <span className="font-mono text-xs">{formatDate(article.published_at)}</span>
          <span className="text-ink-300">·</span>
          <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" />{article.views_count}</span>
          <span className="flex items-center gap-1.5"><Heart className="w-4 h-4" />{likesCount}</span>
        </div>
        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-5">
            {article.tags.map((tag) => (
              <Tag key={tag.id} name={tag.name} slug={tag.slug} size="md" />
            ))}
          </div>
        )}
      </header>

      <div
        className="article-content"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />

      <div className="flex items-center justify-center gap-6 my-12 py-6 border-t border-b border-ink-200">
        <Button variant="ghost" onClick={handleLike} className="flex items-center gap-2">
          <Heart className={`w-5 h-5 transition-colors ${liked ? 'fill-vermilion-500 text-vermilion-500' : ''}`} />
          <span className="font-mono text-sm">{likesCount}</span>
        </Button>
        <Button variant="ghost" onClick={handleFavorite} className="flex items-center gap-2">
          <Bookmark className={`w-5 h-5 transition-colors ${favorited ? 'fill-amber-500 text-amber-500' : ''}`} />
          <span className="text-sm">{favorited ? '已收藏' : '收藏'}</span>
        </Button>
        <Button variant="ghost" className="flex items-center gap-2">
          <Share2 className="w-5 h-5" />
          <span className="text-sm">分享</span>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-10">
        {article.prev_article ? (
          <Link
            href={`/articles/${article.prev_article.slug}`}
            className="flex items-center gap-3 p-5 border border-ink-200 hover:border-vermilion-200 hover:bg-vermilion-50/50 transition-all duration-300 group"
          >
            <ChevronLeft className="w-5 h-5 text-ink-300 group-hover:text-vermilion-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-ink-400 mb-1.5">上一篇</p>
              <p className="text-sm font-medium text-ink-700 truncate group-hover:text-vermilion-700 transition-colors">
                {article.prev_article.title}
              </p>
            </div>
          </Link>
        ) : <div />}
        {article.next_article && (
          <Link
            href={`/articles/${article.next_article.slug}`}
            className="flex items-center gap-3 p-5 border border-ink-200 hover:border-vermilion-200 hover:bg-vermilion-50/50 transition-all duration-300 group text-right"
          >
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-ink-400 mb-1.5">下一篇</p>
              <p className="text-sm font-medium text-ink-700 truncate group-hover:text-vermilion-700 transition-colors">
                {article.next_article.title}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-ink-300 group-hover:text-vermilion-500 shrink-0" />
          </Link>
        )}
      </div>
    </article>
  )
}
