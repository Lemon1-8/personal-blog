'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { login } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

export function LoginForm() {
  const router = useRouter()
  const { login: authLogin } = useAuthStore()
  const [formData, setFormData] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await login(formData)
      if (res.code === 0 && res.data) {
        authLogin(res.data.user, res.data.access_token, res.data.refresh_token)
        router.push('/admin')
      } else {
        setError(res.message || '登录失败')
      }
    } catch {
      setError('登录失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="用户名或邮箱"
        type="text"
        value={formData.username}
        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
        placeholder="请输入用户名或邮箱"
        required
      />
      <Input
        label="密码"
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        placeholder="请输入密码"
        required
      />

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <Button type="submit" loading={loading} className="w-full">
        登录
      </Button>

      <p className="text-center text-sm text-slate-500">
        没有账号？
        <Link href="/auth/register" className="text-blue-600 hover:text-blue-800 font-medium ml-1">
          去注册
        </Link>
      </p>
    </form>
  )
}
