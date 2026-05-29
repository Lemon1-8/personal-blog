import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-ink-50 px-6">
      <span className="font-serif text-8xl text-ink-200 font-bold">404</span>
      <h2 className="font-serif text-h2 text-ink-900 mt-4 mb-2">页面未找到</h2>
      <p className="text-ink-500 mb-8">抱歉，您访问的页面不存在或已被移除。</p>
      <Link
        href="/"
        className="px-6 py-2.5 text-sm font-medium text-ink-50 bg-ink-800 hover:bg-ink-900 transition-colors"
      >
        返回首页
      </Link>
    </div>
  )
}
