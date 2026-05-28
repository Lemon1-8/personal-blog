'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Loading } from '@/components/ui/Loading'
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/lib/api'
import { slugify } from '@/lib/utils'
import type { Category } from '@/lib/api'
import { Edit3, Trash2, Plus } from 'lucide-react'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editModal, setEditModal] = useState<{ open: boolean; category?: Category }>({ open: false })
  const [deleteModal, setDeleteModal] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: '', slug: '', description: '', order: 0 })

  const load = async () => {
    setLoading(true)
    try {
      const res = await getCategories()
      setCategories(res.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setFormData({ name: '', slug: '', description: '', order: 0 })
    setEditModal({ open: true })
  }

  const openEdit = (cat: Category) => {
    setFormData({ name: cat.name, slug: cat.slug, description: cat.description, order: cat.order })
    setEditModal({ open: true, category: cat })
  }

  const handleSave = async () => {
    if (editModal.category) {
      await updateCategory(editModal.category.id, formData)
    } else {
      await createCategory(formData)
    }
    setEditModal({ open: false })
    load()
  }

  const handleDelete = async (id: string) => {
    await deleteCategory(id)
    setDeleteModal(null)
    load()
  }

  if (loading) return <Loading />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-h3 text-slate-900">分类管理</h1>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-1" /> 新建分类
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 text-xs text-slate-500 uppercase">
              <th className="text-left px-6 py-3 font-medium">名称</th>
              <th className="text-left px-6 py-3 font-medium">Slug</th>
              <th className="text-left px-6 py-3 font-medium">描述</th>
              <th className="text-left px-6 py-3 font-medium">文章数</th>
              <th className="text-left px-6 py-3 font-medium">排序</th>
              <th className="text-right px-6 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm font-medium text-slate-900">{cat.name}</td>
                <td className="px-6 py-4 text-sm text-slate-500 font-mono">{cat.slug}</td>
                <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">{cat.description}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{cat.article_count}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{cat.order}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(cat)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteModal(cat.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit/Create Modal */}
      <Modal
        isOpen={editModal.open}
        onClose={() => setEditModal({ open: false })}
        title={editModal.category ? '编辑分类' : '新建分类'}
      >
        <div className="space-y-4">
          <Input
            label="名称"
            value={formData.name}
            onChange={(e) => {
              const name = e.target.value
              setFormData({ ...formData, name, slug: editModal.category ? formData.slug : slugify(name) })
            }}
          />
          <Input
            label="Slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">描述</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Input
            label="排序"
            type="number"
            value={String(formData.order)}
            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setEditModal({ open: false })}>取消</Button>
            <Button onClick={handleSave}>保存</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="确认删除" size="sm">
        <p className="text-sm text-slate-600 mb-4">确定要删除此分类吗？如有文章则无法删除。</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteModal(null)}>取消</Button>
          <Button variant="danger" onClick={() => deleteModal && handleDelete(deleteModal)}>删除</Button>
        </div>
      </Modal>
    </div>
  )
}
