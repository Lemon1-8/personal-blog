'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Editor } from '@/components/article/Editor'
import { createArticle, getCategories, getTags } from '@/lib/api'
import { slugify } from '@/lib/utils'
import type { Category, Tag } from '@/lib/api'
import { Pin } from 'lucide-react'

export default function NewArticlePage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    summary: '',
    content: '',
    content_type: 'markdown',
    category_id: '',
    tag_ids: [] as string[],
    is_pinned: false,
    status: 'draft',
  })

  useEffect(() => {
    getCategories().then((res) => setCategories(res.data))
    getTags().then((res) => setAllTags(res.data))
  }, [])

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
        ? prev.tag_ids.filter((id) => id !== tagId)
        : [...prev.tag_ids, tagId],
    }))
  }

  const save = async (status: string) => {
    setSaving(true)
    try {
      await createArticle({ ...formData, status })
      router.push('/admin/articles')
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-h3 text-ink-900">新建文章</h1>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => save('draft')} loading={saving}>
            保存草稿
          </Button>
          <Button onClick={() => save('published')} loading={saving}>
            发布
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
            placeholder="url-friendly-slug"
          />
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">摘要</label>
            <textarea
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              placeholder="文章摘要..."
              rows={3}
              className="w-full px-3 py-2 border border-ink-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-vermilion-300 focus:border-vermilion-300 placeholder:text-ink-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">正文（Markdown）</label>
            <Editor
              value={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-ink-200 p-4">
            <h3 className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-3">发布设置</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">分类</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-3 py-2 border border-ink-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-vermilion-300 focus:border-vermilion-300"
                >
                  <option value="">选择分类</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, is_pinned: !formData.is_pinned })}
                  className={`w-full flex items-center gap-3 px-4 py-3 border transition-all duration-200 ${
                    formData.is_pinned
                      ? 'border-amber-300 bg-amber-50 text-amber-800'
                      : 'border-ink-200 bg-white text-ink-500 hover:border-ink-300'
                  }`}
                >
                  <Pin className={`w-4 h-4 ${formData.is_pinned ? 'text-amber-500' : 'text-ink-300'}`} />
                  <div className="text-left">
                    <div className="text-sm font-medium">置顶文章</div>
                    <div className="text-xs mt-0.5 opacity-60">
                      {formData.is_pinned ? '已置顶，将在首页优先展示' : '点击置顶，首页优先展示'}
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white border border-ink-200 p-4">
            <h3 className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-3">标签</h3>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={`px-2.5 py-1 text-xs border transition-colors ${
                    formData.tag_ids.includes(tag.id)
                      ? 'bg-ink-800 text-ink-50 border-ink-800'
                      : 'bg-white text-ink-500 border-ink-200 hover:border-ink-300'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
