'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Loading } from '@/components/ui/Loading'
import { getPublicSettings } from '@/lib/api'
import type { SiteSettings } from '@/lib/api'
import { Github } from 'lucide-react'

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
        <div className="max-w-content mx-auto px-6 py-14">
          <p className="text-caption uppercase tracking-[0.2em] text-ink-400 mb-2 font-medium">
            关于
          </p>
          <h1 className="font-serif text-display-sm text-ink-900 mb-10">
            关于本站
          </h1>
          {loading ? (
            <Loading />
          ) : (
            <div className="space-y-6">
              <div className="bg-white border border-ink-200 p-10 text-center">
                <div className="w-16 h-16 mx-auto mb-5 bg-ink-800 flex items-center justify-center">
                  <span className="font-serif text-2xl text-ink-50 font-bold">L</span>
                </div>
                <h2 className="font-serif text-h2 text-ink-900 mb-3">
                  {settings?.site_name || 'Lemon Blog'}
                </h2>
                <p className="text-ink-500 leading-relaxed max-w-md mx-auto">
                  {settings?.site_description || '记录技术成长，分享知识见解'}
                </p>
              </div>

              <div className="bg-white border border-ink-200 p-10">
                <h2 className="font-serif text-h3 text-ink-900 mb-4">关于我</h2>
                <div className="text-body text-ink-600 leading-relaxed space-y-4">
                  <p>
                    一个热爱技术与创造的人。在这里记录学习的过程、思考的碎片，以及对世界的观察。
                  </p>
                  <p>
                    写代码、读好书、探索未知。保持好奇心，持续成长。
                  </p>
                </div>
              </div>

              {settings?.social_links && (
                <div className="bg-white border border-ink-200 p-10">
                  <h2 className="font-serif text-h3 text-ink-900 mb-5">找到我</h2>
                  <div className="flex gap-6">
                    {settings.social_links.github && (
                      <a
                        href={settings.social_links.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-ink-500 hover:text-ink-800 transition-colors"
                      >
                        <Github className="w-5 h-5" />
                        <span>GitHub</span>
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
