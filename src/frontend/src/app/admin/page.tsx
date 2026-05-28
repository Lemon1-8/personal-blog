'use client'

import { useState, useEffect } from 'react'
import { getArticles, getUsers, getCategories } from '@/lib/api'
import { FileText, Users, FolderTree, Eye, Clock } from 'lucide-react'
import type { ArticleListItem, User, Category } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  color: string
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [recentArticles, setRecentArticles] = useState<ArticleListItem[]>([])
  const [stats, setStats] = useState({
    totalArticles: 0,
    draftCount: 0,
    totalUsers: 0,
    totalCategories: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [articlesRes, usersRes, catsRes] = await Promise.all([
          getArticles({ page: 1, page_size: 100 }),
          getUsers({ page: 1, page_size: 1 }),
          getCategories(),
        ])
        const allArticles = articlesRes.data.items
        setStats({
          totalArticles: allArticles.length,
          draftCount: 0,
          totalUsers: usersRes.data.total,
          totalCategories: catsRes.data.length,
        })
        setRecentArticles(allArticles.slice(0, 5))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div>
      <h1 className="text-h3 text-slate-900 mb-6">控制台</h1>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard icon={FileText} label="文章总数" value={stats.totalArticles} color="bg-blue-600" />
        <StatCard icon={Clock} label="草稿数量" value={stats.draftCount} color="bg-amber-500" />
        <StatCard icon={Users} label="用户总数" value={stats.totalUsers} color="bg-green-600" />
        <StatCard icon={FolderTree} label="分类数量" value={stats.totalCategories} color="bg-purple-600" />
      </div>

      {/* Recent Articles */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">最近文章</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-slate-500 uppercase">
                <th className="text-left px-6 py-3 font-medium">标题</th>
                <th className="text-left px-6 py-3 font-medium">分类</th>
                <th className="text-left px-6 py-3 font-medium">浏览</th>
                <th className="text-left px-6 py-3 font-medium">发布时间</th>
                <th className="text-right px-6 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentArticles.map((article) => (
                <tr key={article.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3 text-sm text-slate-900 font-medium">
                    <Link href={`/admin/articles/${article.id}`} className="hover:text-blue-600">
                      {article.title}
                    </Link>
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-500">{article.category.name}</td>
                  <td className="px-6 py-3 text-sm text-slate-500">{article.views_count}</td>
                  <td className="px-6 py-3 text-sm text-slate-500">{formatDate(article.published_at)}</td>
                  <td className="px-6 py-3 text-right">
                    <Link
                      href={`/admin/articles/${article.id}`}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      编辑
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
