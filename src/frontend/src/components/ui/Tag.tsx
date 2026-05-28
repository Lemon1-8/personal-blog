'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

interface TagProps {
  name: string
  slug: string
  variant?: 'default' | 'primary'
  clickable?: boolean
  size?: 'sm' | 'md'
  className?: string
}

export function Tag({
  name,
  slug,
  variant = 'default',
  clickable = true,
  size = 'sm',
  className,
}: TagProps) {
  const baseClasses = cn(
    'inline-flex items-center rounded-full font-medium',
    size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
    variant === 'default'
      ? 'bg-slate-100 text-slate-600'
      : 'bg-blue-100 text-blue-700',
    clickable && 'hover:bg-blue-200 cursor-pointer transition-colors',
    className
  )

  if (clickable) {
    return (
      <Link href={`/tags/${slug}`} className={baseClasses}>
        {name}
      </Link>
    )
  }

  return <span className={baseClasses}>{name}</span>
}
