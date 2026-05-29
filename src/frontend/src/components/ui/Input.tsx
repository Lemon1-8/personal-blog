'use client'

import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-ink-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-3 py-2 border text-sm bg-white rounded-sm',
            'focus:outline-none focus:ring-1 focus:ring-vermilion-300 focus:border-vermilion-300',
            'placeholder:text-ink-400',
            error
              ? 'border-vermilion-500 focus:ring-vermilion-500'
              : 'border-ink-200',
            props.disabled && 'bg-ink-100 text-ink-400 cursor-not-allowed',
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-vermilion-600 mt-1.5">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
