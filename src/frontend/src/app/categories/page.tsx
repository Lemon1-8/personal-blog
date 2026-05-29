'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Loading } from '@/components/ui/Loading'
import { getCategories } from '@/lib/api'
import type { Category } from '@/lib/api'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-page mx-auto px-6 py-10">
          <p className="text-caption uppercase tracking-[0.2em] text-ink-400 mb-2 font-medium">
            分类
          </p>
          <h1 className="font-serif text-display-sm text-ink-900 mb-10">
            文章分类
          </h1>
          {loading ? (
            <Loading />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  className="group block bg-white border border-ink-200 p-6 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300"
                >
                  <h2 className="font-serif text-xl font-semibold text-ink-900 group-hover:text-vermilion-700 transition-colors mb-3">
                    {cat.name}
                  </h2>
                  {cat.description && (
                    <p className="text-sm text-ink-500 leading-relaxed">{cat.description}</p>
                  )}
                  <div className="mt-5 pt-4 border-t border-ink-100">
                    <span className="text-xs text-ink-400 font-mono">
                      {cat.article_count} 篇文章
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
