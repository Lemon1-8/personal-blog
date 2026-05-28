'use client'

import Link from 'next/link'

interface CategoryBadgeProps {
  name: string
  slug: string
  className?: string
}

export function CategoryBadge({ name, slug, className }: CategoryBadgeProps) {
  return (
    <Link
      href={`/categories/${slug}`}
      className={`inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors ${className || ''}`}
    >
      {name}
    </Link>
  )
}
