'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { register } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

export function RegisterForm() {
  const router = useRouter()
  const { login: authLogin } = useAuthStore()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    nickname: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (formData.username.length < 3 || formData.username.length > 32) {
      newErrors.username = '用户名长度需在 3-32 字符之间'
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址'
    }
    if (formData.password.length < 8) {
      newErrors.password = '密码至少需要 8 个字符'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = '密码需包含大写字母、小写字母和数字'
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '两次密码输入不一致'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const res = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        nickname: formData.nickname || undefined,
      })
      if (res.code === 0 && res.data) {
        authLogin(res.data.user, res.data.access_token, res.data.refresh_token)
        router.push('/')
      } else {
        setErrors({ form: res.message || '注册失败' })
      }
    } catch {
      setErrors({ form: '注册失败，请稍后重试' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="用户名"
        value={formData.username}
        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
        placeholder="3-32 字符，字母数字下划线"
        error={errors.username}
        required
      />
      <Input
        label="邮箱"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="your@email.com"
        error={errors.email}
        required
      />
      <Input
        label="昵称（可选）"
        value={formData.nickname}
        onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
        placeholder="显示名称"
      />
      <Input
        label="密码"
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        placeholder="至少 8 位，含大小写字母和数字"
        error={errors.password}
        required
      />
      <Input
        label="确认密码"
        type="password"
        value={formData.confirmPassword}
        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
        placeholder="再次输入密码"
        error={errors.confirmPassword}
        required
      />

      {errors.form && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{errors.form}</p>
        </div>
      )}

      <Button type="submit" loading={loading} className="w-full">
        注册
      </Button>

      <p className="text-center text-sm text-slate-500">
        已有账号？
        <Link href="/auth/login" className="text-blue-600 hover:text-blue-800 font-medium ml-1">
          去登录
        </Link>
      </p>
    </form>
  )
}
