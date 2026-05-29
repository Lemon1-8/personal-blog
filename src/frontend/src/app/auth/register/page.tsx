'use client'

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { RegisterForm } from '@/components/auth/RegisterForm'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-sm">
          <div className="bg-white border border-ink-200 p-8">
            <h1 className="font-serif text-h2 text-ink-900 text-center mb-6">注册</h1>
            <RegisterForm />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
