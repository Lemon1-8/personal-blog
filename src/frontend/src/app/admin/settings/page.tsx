'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Loading } from '@/components/ui/Loading'
import { getPublicSettings, updateSettings } from '@/lib/api'
import type { SiteSettings } from '@/lib/api'
import { Save } from 'lucide-react'

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    site_name: '',
    site_description: '',
    site_logo: '',
    favicon: '',
    social_links: { github: '', twitter: '', weibo: '' },
    custom_footer: '',
  })

  useEffect(() => {
    getPublicSettings().then((res) => {
      const s = res.data
      setFormData({
        site_name: s.site_name,
        site_description: s.site_description,
        site_logo: s.site_logo,
        favicon: s.favicon,
        social_links: {
          github: s.social_links?.github || '',
          twitter: s.social_links?.twitter || '',
          weibo: s.social_links?.weibo || '',
        },
        custom_footer: s.custom_footer || '',
      })
    }).finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateSettings(formData)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loading />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-h3 text-slate-900">网站设置</h1>
        <Button onClick={handleSave} loading={saving}>
          <Save className="w-4 h-4 mr-1" /> 保存设置
        </Button>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-900">基本信息</h2>
          <Input
            label="网站名称"
            value={formData.site_name}
            onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">网站描述</label>
            <textarea
              value={formData.site_description}
              onChange={(e) => setFormData({ ...formData, site_description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Input
            label="Logo URL"
            value={formData.site_logo}
            onChange={(e) => setFormData({ ...formData, site_logo: e.target.value })}
          />
          <Input
            label="Favicon URL"
            value={formData.favicon}
            onChange={(e) => setFormData({ ...formData, favicon: e.target.value })}
          />
        </div>

        {/* Social Links */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-900">社交链接</h2>
          <Input
            label="GitHub"
            value={formData.social_links.github}
            onChange={(e) =>
              setFormData({
                ...formData,
                social_links: { ...formData.social_links, github: e.target.value },
              })
            }
          />
          <Input
            label="Twitter"
            value={formData.social_links.twitter}
            onChange={(e) =>
              setFormData({
                ...formData,
                social_links: { ...formData.social_links, twitter: e.target.value },
              })
            }
          />
          <Input
            label="微博"
            value={formData.social_links.weibo}
            onChange={(e) =>
              setFormData({
                ...formData,
                social_links: { ...formData.social_links, weibo: e.target.value },
              })
            }
          />
        </div>

        {/* Custom Footer */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-900">自定义页脚</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">页脚 HTML</label>
            <textarea
              value={formData.custom_footer || ''}
              onChange={(e) => setFormData({ ...formData, custom_footer: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="自定义页脚 HTML 内容..."
            />
          </div>
        </div>
      </div>
    </div>
  )
}
