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
    'inline-flex items-center font-medium transition-colors duration-200',
    size === 'sm'
      ? 'px-2.5 py-0.5 text-xs rounded-sm'
      : 'px-3 py-1 text-sm rounded-sm',
    variant === 'default'
      ? 'bg-ink-100 text-ink-500 hover:bg-ink-200 hover:text-ink-700'
      : 'bg-vermilion-50 text-vermilion-700 hover:bg-vermilion-100',
    clickable && 'cursor-pointer',
    className
  )

  if (clickable) {
    return (
      <Link href={`/tags/${slug}`} className={baseClasses}>
        #{name}
      </Link>
    )
  }

  return <span className={baseClasses}>#{name}</span>
}
