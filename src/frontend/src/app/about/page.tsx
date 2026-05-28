'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Loading } from '@/components/ui/Loading'
import { getPublicSettings } from '@/lib/api'
import type { SiteSettings } from '@/lib/api'
import { Github, Twitter } from 'lucide-react'

export default function AboutPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPublicSettings()
      .then((res) => setSettings(res.data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-content mx-auto px-4 py-12">
          <h1 className="text-h2 text-slate-900 mb-8">关于</h1>
          {loading ? (
            <Loading />
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-8">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl font-bold text-white">L</span>
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    {settings?.site_name || 'Lemon Blog'}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {settings?.site_description || '记录技术成长，分享知识见解'}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-8">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">关于本站</h2>
                <div className="prose prose-slate max-w-none">
                  <p>
                    这是一个个人博客，用于记录技术成长、分享知识见解。
                  </p>
                </div>
              </div>

              {/* Social Links */}
              {settings?.social_links && (
                <div className="bg-white rounded-xl border border-slate-200 p-8">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">社交链接</h2>
                  <div className="space-y-3">
                    {settings.social_links.github && (
                      <a
                        href={settings.social_links.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-sm text-slate-600 hover:text-blue-600 transition-colors"
                      >
                        <Github className="w-5 h-5" />
                        GitHub
                      </a>
                    )}
                    {settings.social_links.twitter && (
                      <a
                        href={settings.social_links.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-sm text-slate-600 hover:text-blue-600 transition-colors"
                      >
                        <Twitter className="w-5 h-5" />
                        Twitter
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
