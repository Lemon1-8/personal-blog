'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Loading } from '@/components/ui/Loading'
import { getMedia, deleteMedia } from '@/lib/api'
import { formatDate, formatFileSize } from '@/lib/utils'
import type { MediaItem } from '@/lib/api'
import { Upload, Trash2, Copy, ImageIcon } from 'lucide-react'

export default function AdminMediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState<string | null>(null)
  const [viewModal, setViewModal] = useState<MediaItem | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await getMedia()
      setMedia(res.data.items)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id: string) => {
    await deleteMedia(id)
    setDeleteModal(null)
    load()
  }

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
  }

  if (loading) return <Loading />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-h3 text-slate-900">媒体库</h1>
        <label className="cursor-pointer">
          <Button>
            <Upload className="w-4 h-4 mr-1" /> 上传图片
          </Button>
          <input type="file" accept="image/*" className="hidden" multiple />
        </label>
      </div>

      {media.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 mb-2">暂无媒体文件</p>
          <p className="text-sm text-slate-400">上传您的第一张图片</p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {media.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden group"
            >
              <div
                className="aspect-video bg-slate-100 flex items-center justify-center cursor-pointer"
                onClick={() => setViewModal(item)}
              >
                <ImageIcon className="w-8 h-8 text-slate-300" />
              </div>
              <div className="p-3">
                <p className="text-xs text-slate-700 truncate">{item.filename}</p>
                <p className="text-xs text-slate-400 mt-1">{formatFileSize(item.size)}</p>
                <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleCopyUrl(item.url)}
                    className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                    title="复制 URL"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setDeleteModal(item.id)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                    title="删除"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Modal */}
      <Modal isOpen={!!viewModal} onClose={() => setViewModal(null)} title="图片详情" size="md">
        {viewModal && (
          <div className="space-y-4">
            <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center">
              <ImageIcon className="w-16 h-16 text-slate-300" />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-slate-500">文件名：</span>
                <span className="text-slate-900">{viewModal.filename}</span>
              </div>
              <div>
                <span className="text-slate-500">大小：</span>
                <span className="text-slate-900">{formatFileSize(viewModal.size)}</span>
              </div>
              <div>
                <span className="text-slate-500">尺寸：</span>
                <span className="text-slate-900">{viewModal.width}×{viewModal.height}</span>
              </div>
              <div>
                <span className="text-slate-500">类型：</span>
                <span className="text-slate-900">{viewModal.mime_type}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500">上传时间：</span>
                <span className="text-slate-900">{formatDate(viewModal.created_at)}</span>
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="secondary" onClick={() => handleCopyUrl(viewModal.url)}>
                <Copy className="w-4 h-4 mr-1" /> 复制 URL
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="确认删除" size="sm">
        <p className="text-sm text-slate-600 mb-4">确定要删除此图片吗？此操作不可恢复。</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteModal(null)}>取消</Button>
          <Button variant="danger" onClick={() => deleteModal && handleDelete(deleteModal)}>删除</Button>
        </div>
      </Modal>
    </div>
  )
}
