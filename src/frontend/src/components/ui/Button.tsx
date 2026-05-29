'use client'

import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-vermilion-300 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

  const variantClasses = {
    primary:
      'bg-ink-800 text-ink-50 hover:bg-ink-900 active:bg-ink-900 shadow-sm',
    secondary:
      'bg-white text-ink-700 border border-ink-200 hover:bg-ink-50 active:bg-ink-100',
    ghost:
      'text-ink-600 hover:bg-ink-100 active:bg-ink-200',
    danger:
      'bg-vermilion-600 text-white hover:bg-vermilion-700 active:bg-vermilion-800',
    outline:
      'text-vermilion-600 border border-vermilion-300 hover:bg-vermilion-50 active:bg-vermilion-100',
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-sm',
    md: 'px-5 py-2 text-sm rounded-sm',
    lg: 'px-6 py-3 text-base rounded-sm',
  }

  return (
    <button
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  )
}
