import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-6xl font-bold text-slate-200 mb-4">404</h1>
      <h2 className="text-xl font-semibold text-slate-900 mb-2">页面未找到</h2>
      <p className="text-slate-500 mb-6">抱歉，您访问的页面不存在或已被移除。</p>
      <Link
        href="/"
        className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
      >
        返回首页
      </Link>
    </div>
  )
}
