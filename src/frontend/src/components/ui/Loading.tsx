'use client'

import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

export function Loading({ size = 'md', className, text }: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  }

  return (
    <div className={cn('flex flex-col items-center justify-center py-16', className)}>
      <Loader2 className={cn('animate-spin text-vermilion-500', sizeClasses[size])} />
      {text && <p className="mt-4 text-sm text-ink-400">{text}</p>}
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-white border border-ink-200 p-6 animate-pulse">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-3 bg-ink-200 w-16" />
      </div>
      <div className="h-5 bg-ink-200 w-3/4 mb-3" />
      <div className="h-4 bg-ink-100 w-full mb-2" />
      <div className="h-4 bg-ink-100 w-5/6" />
      <div className="flex gap-3 mt-4">
        <div className="h-3 bg-ink-100 w-12 rounded-sm" />
        <div className="h-3 bg-ink-100 w-12 rounded-sm" />
      </div>
    </div>
  )
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
