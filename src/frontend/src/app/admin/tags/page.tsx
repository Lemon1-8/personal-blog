'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Loading } from '@/components/ui/Loading'
import { getTags, createTag, deleteTag } from '@/lib/api'
import { slugify } from '@/lib/utils'
import type { Tag } from '@/lib/api'
import { Trash2, Plus } from 'lucide-react'

export default function AdminTagsPage() {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteModal, setDeleteModal] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: '', slug: '' })

  const load = async () => {
    setLoading(true)
    try {
      const res = await getTags()
      setTags(res.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    await createTag(formData)
    setCreateOpen(false)
    setFormData({ name: '', slug: '' })
    load()
  }

  const handleDelete = async (id: string) => {
    await deleteTag(id)
    setDeleteModal(null)
    load()
  }

  if (loading) return <Loading />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-h3 text-slate-900">标签管理</h1>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-1" /> 新建标签
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 text-xs text-slate-500 uppercase">
              <th className="text-left px-6 py-3 font-medium">名称</th>
              <th className="text-left px-6 py-3 font-medium">Slug</th>
              <th className="text-left px-6 py-3 font-medium">文章数</th>
              <th className="text-right px-6 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tags.map((tag) => (
              <tr key={tag.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm font-medium text-slate-900">{tag.name}</td>
                <td className="px-6 py-4 text-sm text-slate-500 font-mono">{tag.slug}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{tag.article_count}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => setDeleteModal(tag.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="新建标签" size="sm">
        <div className="space-y-4">
          <Input
            label="名称"
            value={formData.name}
            onChange={(e) => {
              const name = e.target.value
              setFormData({ name, slug: slugify(name) })
            }}
          />
          <Input
            label="Slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>取消</Button>
            <Button onClick={handleCreate}>创建</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="确认删除" size="sm">
        <p className="text-sm text-slate-600 mb-4">确定要删除此标签吗？</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteModal(null)}>取消</Button>
          <Button variant="danger" onClick={() => deleteModal && handleDelete(deleteModal)}>删除</Button>
        </div>
      </Modal>
    </div>
  )
}
