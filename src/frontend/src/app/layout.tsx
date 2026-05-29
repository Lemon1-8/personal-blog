import type { Metadata } from 'next'
import '../styles/globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: {
    default: 'Lemon Blog — 技术·生活·随笔',
    template: '%s — Lemon Blog',
  },
  description: '记录技术成长，分享知识见解',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400..600;0,9..40,700;1,9..40,400..600&family=JetBrains+Mono:ital,wght@0,400..600;1,400&family=Noto+Serif+SC:wght@400;500;600;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-ink-50 text-ink-800 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
