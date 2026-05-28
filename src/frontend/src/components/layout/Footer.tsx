'use client'

import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 mt-16">
      <div className="max-w-page mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Lemon Blog</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              记录技术成长，分享知识见解。用文字连接世界。
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">导航</h3>
            <ul className="space-y-2">
              {[
                { href: '/articles', label: '文章' },
                { href: '/categories', label: '分类' },
                { href: '/tags', label: '标签' },
                { href: '/about', label: '关于' },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-slate-500 hover:text-blue-600 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">社交</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-500 hover:text-blue-600 transition-colors"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-500 hover:text-blue-600 transition-colors"
                >
                  Twitter
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-slate-200 text-center">
          <p className="text-sm text-slate-400">
            &copy; {new Date().getFullYear()} Lemon Blog. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
