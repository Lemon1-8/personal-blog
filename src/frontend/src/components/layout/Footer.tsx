'use client'

import Link from 'next/link'

const navLinks = [
  { href: '/articles', label: '文章' },
  { href: '/categories', label: '分类' },
  { href: '/tags', label: '标签' },
  { href: '/about', label: '关于' },
]

export function Footer() {
  return (
    <footer className="mt-20 border-t border-ink-200">
      <div className="max-w-page mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr] gap-10">
          <div>
            <span className="font-serif text-xl font-bold text-ink-900 tracking-tight">
              Lemon Blog
            </span>
            <p className="mt-3 text-sm text-ink-500 leading-relaxed max-w-xs">
              记录技术成长，分享知识见解。
              <br />
              用文字连接世界。
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-ink-400 uppercase tracking-widest mb-4">
              导航
            </h3>
            <ul className="space-y-2.5">
              {navLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-ink-500 hover:text-vermilion-600 transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-ink-400 uppercase tracking-widest mb-4">
              社交
            </h3>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="https://github.com/Lemon1-8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-ink-500 hover:text-vermilion-600 transition-colors duration-200"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Ornament divider */}
        <div className="ornament my-8">✽</div>

        <p className="text-center text-xs text-ink-400">
          &copy; {new Date().getFullYear()} Lemon Blog
        </p>
      </div>
    </footer>
  )
}
