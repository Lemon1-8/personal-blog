'use client'

import { useState, useCallback } from 'react'
import { Bold, Italic, Heading1, Heading2, List, ListOrdered, Quote, Code, Link as LinkIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface EditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
}

export function Editor({
  value,
  onChange,
  placeholder = '开始写作...',
  minHeight = '400px',
}: EditorProps) {
  const [textareaValue, setTextareaValue] = useState(value)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value
      setTextareaValue(newValue)
      onChange(newValue)
    },
    [onChange]
  )

  const insertMarkdown = useCallback(
    (prefix: string, suffix: string = '') => {
      const textarea = document.querySelector('.editor-textarea') as HTMLTextAreaElement
      if (!textarea) return

      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const selectedText = textareaValue.substring(start, end)
      const newText =
        textareaValue.substring(0, start) +
        prefix +
        selectedText +
        suffix +
        textareaValue.substring(end)

      setTextareaValue(newText)
      onChange(newText)

      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(
          start + prefix.length,
          start + prefix.length + selectedText.length
        )
      }, 0)
    },
    [textareaValue, onChange]
  )

  const toolbarItems = [
    { icon: Bold, label: '加粗', action: () => insertMarkdown('**', '**') },
    { icon: Italic, label: '斜体', action: () => insertMarkdown('*', '*') },
    { icon: Heading1, label: '标题 1', action: () => insertMarkdown('# ') },
    { icon: Heading2, label: '标题 2', action: () => insertMarkdown('## ') },
    { icon: List, label: '无序列表', action: () => insertMarkdown('- ') },
    { icon: ListOrdered, label: '有序列表', action: () => insertMarkdown('1. ') },
    { icon: Quote, label: '引用', action: () => insertMarkdown('> ') },
    { icon: Code, label: '代码块', action: () => insertMarkdown('```\n', '\n```') },
    { icon: LinkIcon, label: '链接', action: () => insertMarkdown('[', '](url)') },
  ]

  return (
    <div className="border border-slate-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-3 py-2 bg-slate-50 border-b border-slate-200 flex-wrap">
        {toolbarItems.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={item.action}
            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title={item.label}
          >
            <item.icon className="w-4 h-4" />
          </button>
        ))}
      </div>

      {/* Editor Area */}
      <textarea
        className="editor-textarea w-full p-4 text-sm font-mono leading-relaxed resize-y focus:outline-none"
        value={textareaValue}
        onChange={handleChange}
        placeholder={placeholder}
        style={{ minHeight }}
      />

      {/* Preview Toggle Hint */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-400">
        支持 Markdown 语法
      </div>
    </div>
  )
}
