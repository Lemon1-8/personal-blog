'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Loading } from '@/components/ui/Loading'
import { getUsers, updateUser, deleteUser } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import type { User } from '@/lib/api'
import { Edit3, Trash2 } from 'lucide-react'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [editModal, setEditModal] = useState<{ open: boolean; user?: User }>({ open: false })
  const [deleteModal, setDeleteModal] = useState<string | null>(null)
  const [formData, setFormData] = useState({ nickname: '', role: 'user', bio: '' })

  const load = async () => {
    setLoading(true)
    try {
      const res = await getUsers()
      setUsers(res.data.items)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openEdit = (user: User) => {
    setFormData({ nickname: user.nickname, role: user.role, bio: user.bio || '' })
    setEditModal({ open: true, user })
  }

  const handleSave = async () => {
    if (editModal.user) {
      await updateUser(editModal.user.id, formData)
    }
    setEditModal({ open: false })
    load()
  }

  const handleDelete = async (id: string) => {
    await deleteUser(id)
    setDeleteModal(null)
    load()
  }

  if (loading) return <Loading />

  return (
    <div>
      <h1 className="text-h3 text-slate-900 mb-6">用户管理</h1>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 text-xs text-slate-500 uppercase">
              <th className="text-left px-6 py-3 font-medium">用户名</th>
              <th className="text-left px-6 py-3 font-medium">邮箱</th>
              <th className="text-left px-6 py-3 font-medium">昵称</th>
              <th className="text-left px-6 py-3 font-medium">角色</th>
              <th className="text-left px-6 py-3 font-medium">状态</th>
              <th className="text-left px-6 py-3 font-medium">注册时间</th>
              <th className="text-right px-6 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm font-medium text-slate-900">{user.username}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{user.email}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{user.nickname}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {user.role === 'admin' ? '管理员' : '用户'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    活跃
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">{formatDate(user.created_at)}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(user)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteModal(user.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={editModal.open}
        onClose={() => setEditModal({ open: false })}
        title="编辑用户"
      >
        <div className="space-y-4">
          <Input
            label="昵称"
            value={formData.nickname}
            onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">角色</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="user">用户</option>
              <option value="admin">管理员</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">简介</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setEditModal({ open: false })}>取消</Button>
            <Button onClick={handleSave}>保存</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="确认删除" size="sm">
        <p className="text-sm text-slate-600 mb-4">确定要删除此用户吗？此操作不可恢复。</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteModal(null)}>取消</Button>
          <Button variant="danger" onClick={() => deleteModal && handleDelete(deleteModal)}>删除</Button>
        </div>
      </Modal>
    </div>
  )
}
