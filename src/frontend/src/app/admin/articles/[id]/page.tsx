'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Editor } from '@/components/article/Editor'
import { Loading } from '@/components/ui/Loading'
import { getArticle, updateArticle, getCategories, getTags } from '@/lib/api'
import { slugify } from '@/lib/utils'
import type { Category, Tag } from '@/lib/api'

export default function EditArticlePage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [categories, setCategories] = useState<Category[]>([])
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    summary: '',
    content: '',
    category_id: '',
    tag_ids: [] as string[],
    is_pinned: false,
    status: 'draft',
  })

  useEffect(() => {
    async function load() {
      try {
        const [articleRes, catsRes, tagsRes] = await Promise.all([
          getArticle(id),
          getCategories(),
          getTags(),
        ])
        const article = articleRes.data
        if (article) {
          setFormData({
            title: article.title,
            slug: article.slug,
            summary: article.summary,
            content: article.content || '',
            category_id: article.category?.id || '',
            tag_ids: article.tags.map((t) => t.id),
            is_pinned: article.is_pinned,
            status: 'published',
          })
        }
        setCategories(catsRes.data)
        setAllTags(tagsRes.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: prev.slug || slugify(title),
    }))
  }

  const toggleTag = (tagId: string) => {
    setFormData((prev) => ({
      ...prev,
      tag_ids: prev.tag_ids.includes(tagId)
        ? prev.tag_ids.filter((tid) => tid !== tagId)
        : [...prev.tag_ids, tagId],
    }))
  }

  const save = async (status: string) => {
    setSaving(true)
    try {
      await updateArticle(id, { ...formData, status })
      router.push('/admin/articles')
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loading />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-h3 text-slate-900">编辑文章</h1>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => save('draft')} loading={saving}>
            保存草稿
          </Button>
          <Button onClick={() => save('published')} loading={saving}>
            更新发布
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Input
            label="标题"
            value={formData.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="文章标题"
          />
          <Input
            label="Slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">摘要</label>
            <textarea
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">正文</label>
            <Editor
              value={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">分类</label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">选择分类</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">标签</label>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
                    formData.tag_ids.includes(tag.id)
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_pinned}
                onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">置顶文章</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
