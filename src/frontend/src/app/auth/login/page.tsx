'use client'

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-sm">
          <div className="bg-white border border-ink-200 p-8">
            <h1 className="font-serif text-h2 text-ink-900 text-center mb-6">登录</h1>
            <LoginForm />
            <div className="mt-5 p-4 bg-amber-50 border border-amber-200">
              <p className="text-xs text-amber-800 leading-relaxed">
                <strong>Demo 账号：</strong><br />
                用户名：admin<br />
                密码：Admin123!
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
