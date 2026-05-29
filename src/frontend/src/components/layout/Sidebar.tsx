'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  FolderTree,
  Tags,
  Image,
  Users,
  Settings,
  ArrowLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const sidebarItems = [
  {
    section: '概览',
    items: [
      { href: '/admin', label: '控制台', icon: LayoutDashboard },
    ],
  },
  {
    section: '内容管理',
    items: [
      { href: '/admin/articles', label: '所有文章', icon: FileText },
      { href: '/admin/articles/new', label: '写文章', icon: PlusCircle },
    ],
  },
  {
    section: '分类管理',
    items: [
      { href: '/admin/categories', label: '分类', icon: FolderTree },
      { href: '/admin/tags', label: '标签', icon: Tags },
    ],
  },
  {
    section: '其他',
    items: [
      { href: '/admin/media', label: '媒体库', icon: Image },
      { href: '/admin/users', label: '用户', icon: Users },
      { href: '/admin/settings', label: '设置', icon: Settings },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 bg-ink-900 text-ink-200 flex flex-col h-screen sticky top-0">
      <div className="p-4 border-b border-ink-700">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="font-serif text-lg font-bold text-ink-50">管理后台</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-6">
        {sidebarItems.map((section) => (
          <div key={section.section}>
            <p className="px-3 text-[10px] font-medium text-ink-500 uppercase tracking-widest mb-2">
              {section.section}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/admin' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 text-sm transition-colors',
                      isActive
                        ? 'bg-vermilion-600 text-white'
                        : 'text-ink-400 hover:bg-ink-800 hover:text-ink-100'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-ink-700">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2.5 text-sm text-ink-400 hover:bg-ink-800 hover:text-ink-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回前台
        </Link>
      </div>
    </aside>
  )
}
