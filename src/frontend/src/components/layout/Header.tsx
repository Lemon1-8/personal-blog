'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Search, Menu, X, User, LogOut, Bookmark, LayoutDashboard } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: '首页' },
  { href: '/articles', label: '文章' },
  { href: '/categories', label: '分类' },
  { href: '/tags', label: '标签' },
  { href: '/about', label: '关于' },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, isAdmin, logout } = useAuthStore()

  useEffect(() => {
    setMobileMenuOpen(false)
    setUserMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-40 transition-all duration-300',
        scrolled
          ? 'bg-ink-50/90 backdrop-blur-md shadow-sm'
          : 'bg-ink-50/60 backdrop-blur-sm'
      )}
    >
      <div className="h-[2px] bg-gradient-to-r from-vermilion-400 via-amber-400 to-vermilion-400 opacity-70" />

      <div className="max-w-page mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-serif text-2xl font-bold text-ink-900 tracking-tight">
              Lemon
            </span>
            <span className="hidden sm:inline font-sans text-sm text-ink-400 font-normal pt-1">
              博客
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'relative px-3 py-2 text-sm transition-colors duration-200',
                      isActive
                        ? 'text-vermilion-600 font-medium'
                        : 'text-ink-500 hover:text-ink-800'
                    )}
                  >
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-vermilion-400" />
                    )}
                  </Link>
                )
              })}
            </nav>

            <div className="w-px h-5 bg-ink-200" />

            <div className="flex items-center gap-1">
                            <button
                onClick={() => setSearchOpen(!searchOpen)}
                className={cn(
                  'p-2 rounded-md transition-colors duration-200',
                  searchOpen
                    ? 'text-vermilion-600 bg-vermilion-50'
                    : 'text-ink-400 hover:text-ink-700 hover:bg-ink-100'
                )}
                aria-label="搜索"
              >
                <Search className="w-4 h-4" />
              </button>

                            {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-md hover:bg-ink-100 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-vermilion-500 flex items-center justify-center text-white text-xs font-medium">
                      {user.nickname.charAt(0).toUpperCase()}
                    </div>
                  </button>
                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 mt-2 w-48 bg-ink-50 rounded-lg shadow-float border border-ink-200 py-1 z-20">
                        <div className="px-4 py-3 border-b border-ink-200">
                          <p className="text-sm font-medium text-ink-900">{user.nickname}</p>
                          <p className="text-xs text-ink-500 mt-0.5">{user.email}</p>
                        </div>
                        <Link
                          href="/articles/favorites"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink-600 hover:bg-ink-100 transition-colors"
                        >
                          <Bookmark className="w-4 h-4" /> 我的收藏
                        </Link>
                        {isAdmin && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink-600 hover:bg-ink-100 transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4" /> 管理后台
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-vermilion-600 hover:bg-vermilion-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" /> 退出登录
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-sm font-medium text-vermilion-600 border border-vermilion-300 rounded-md hover:bg-vermilion-50 transition-colors"
                >
                  登录
                </Link>
              )}
            </div>
          </div>

                    <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-ink-500 hover:text-ink-800 rounded-md"
            aria-label="菜单"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

                {searchOpen && (
          <div className="pb-4 animate-slide-up">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索文章..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-ink-200 rounded-md text-sm focus:outline-none focus:border-vermilion-300 focus:ring-1 focus:ring-vermilion-300 placeholder:text-ink-400"
                  autoFocus
                />
              </div>
            </form>
          </div>
        )}
      </div>

            {mobileMenuOpen && (
        <div className="md:hidden border-t border-ink-200 bg-ink-50 animate-slide-up">
          <nav className="px-6 py-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'block px-3 py-2.5 text-sm rounded-md transition-colors',
                  pathname === item.href
                    ? 'text-vermilion-600 bg-vermilion-50 font-medium'
                    : 'text-ink-600 hover:text-ink-800 hover:bg-ink-100'
                )}
              >
                {item.label}
              </Link>
            ))}
            <div className="border-t border-ink-200 pt-3 mt-3">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/articles/favorites"
                    className="block px-3 py-2.5 text-sm text-ink-600 hover:bg-ink-100 rounded-md"
                  >
                    我的收藏
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="block px-3 py-2.5 text-sm text-ink-600 hover:bg-ink-100 rounded-md"
                    >
                      管理后台
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2.5 text-sm text-vermilion-600 hover:bg-vermilion-50 rounded-md"
                  >
                    退出登录
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  className="block px-3 py-2.5 text-sm text-vermilion-600 font-medium hover:bg-vermilion-50 rounded-md"
                >
                  登录
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
