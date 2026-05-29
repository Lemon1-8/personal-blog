'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Plus, Search, Edit3, Trash2, Eye, Pin, PinOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Pagination } from '@/components/ui/Pagination'
import { getArticles, deleteArticle, toggleArticlePin } from '@/lib/api'
import type { ArticleListItem } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { useRouter } from 'next/navigation'

export default function AdminArticlesPage() {
  const router = useRouter()
  const [articles, setArticles] = useState<ArticleListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  type StatusFilter = 'all' | 'published' | 'draft'
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deleteModal, setDeleteModal] = useState<string | null>(null)

  const loadArticles = async () => {
    setLoading(true)
    try {
      const res = await getArticles({ page, page_size: 15 })
      setArticles(res.data.items)
      setTotalPages(res.data.total_pages)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadArticles()
  }, [page])

  const handleTogglePin = async (article: ArticleListItem) => {
    try {
      await toggleArticlePin(article.id, !article.is_pinned)
      setArticles((prev) =>
        prev.map((a) =>
          a.id === article.id ? { ...a, is_pinned: !a.is_pinned } : a
        )
      )
    } catch (err) {
      console.error('Failed to toggle pin:', err)
    }
  }

  const handleDelete = async (id: string) => {
    await deleteArticle(id)
    setDeleteModal(null)
    loadArticles()
  }

  const sortedArticles = useMemo(() => {
    let filtered = articles
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter((a) => a.title.toLowerCase().includes(q))
    }
    if (statusFilter === 'published') {
      filtered = filtered.filter((a) => a.published_at)
    } else if (statusFilter === 'draft') {
      filtered = filtered.filter((a) => !a.published_at)
    }
    const pinned: ArticleListItem[] = []
    const rest: ArticleListItem[] = []
    for (const a of filtered) {
      (a.is_pinned ? pinned : rest).push(a)
    }
    return [...pinned, ...rest]
  }, [articles, searchQuery, statusFilter])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-h3 text-ink-900">文章管理</h1>
        <Link href="/admin/articles/new">
          <Button>
            <Plus className="w-4 h-4 mr-1" />
            写文章
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索标题..."
            className="w-full pl-9 pr-3 py-2 border border-ink-200 bg-white text-sm focus:outline-none focus:border-vermilion-300 focus:ring-1 focus:ring-vermilion-300 placeholder:text-ink-400"
          />
        </div>
        <div className="flex gap-1 border border-ink-200 bg-white">
          {(['all', 'published', 'draft'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-sm transition-colors ${
                statusFilter === status
                  ? 'bg-ink-800 text-ink-50'
                  : 'text-ink-500 hover:text-ink-700'
              }`}
            >
              {status === 'all' ? '全部' : status === 'published' ? '已发布' : '草稿'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-ink-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-ink-100 text-xs text-ink-500 uppercase tracking-wider">
                <th className="text-left px-6 py-3 font-medium">标题</th>
                <th className="text-left px-6 py-3 font-medium">分类</th>
                <th className="text-center px-6 py-3 font-medium w-16">置顶</th>
                <th className="text-left px-6 py-3 font-medium">状态</th>
                <th className="text-left px-6 py-3 font-medium">浏览</th>
                <th className="text-left px-6 py-3 font-medium">发布时间</th>
                <th className="text-right px-6 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {sortedArticles.map((article) => (
                <tr key={article.id} className="hover:bg-ink-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-ink-900 max-w-xs truncate">
                    {article.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-ink-500">{article.category.name}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleTogglePin(article)}
                      className={`p-1.5 transition-colors ${
                        article.is_pinned
                          ? 'text-amber-500 hover:text-amber-600 hover:bg-amber-50'
                          : 'text-ink-300 hover:text-amber-500 hover:bg-amber-50'
                      }`}
                      title={article.is_pinned ? '取消置顶' : '置顶'}
                    >
                      {article.is_pinned ? <Pin className="w-4 h-4" /> : <PinOff className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                      已发布
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-ink-500 font-mono">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {article.views_count}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-ink-500 font-mono">{formatDate(article.published_at)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => router.push(`/admin/articles/${article.id}`)}
                        className="p-1.5 text-ink-400 hover:text-vermilion-600 hover:bg-vermilion-50 transition-colors"
                        title="编辑"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteModal(article.id)}
                        className="p-1.5 text-ink-400 hover:text-vermilion-600 hover:bg-vermilion-50 transition-colors"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {sortedArticles.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-ink-400">
                    暂无文章
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6">
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="确认删除"
        size="sm"
      >
        <p className="text-sm text-ink-600 mb-4">确定要删除这篇文章吗？此操作不可恢复。</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteModal(null)}>
            取消
          </Button>
          <Button variant="danger" onClick={() => deleteModal && handleDelete(deleteModal)}>
            删除
          </Button>
        </div>
      </Modal>
    </div>
  )
}
