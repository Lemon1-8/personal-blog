'use client'

import { create } from 'zustand'
import type { User } from '@/lib/api'
import { getAccessToken, getStoredUser, setStoredUser, clearTokens, setTokens } from '@/lib/auth'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
  isLoading: boolean
  setUser: (user: User) => void
  login: (user: User, accessToken: string, refreshToken: string) => void
  logout: () => void
  initialize: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  isLoading: true,
  setUser: (user) =>
    set({ user, isAuthenticated: true, isAdmin: user.role === 'admin' }),
  login: (user, accessToken, refreshToken) => {
    setTokens(accessToken, refreshToken)
    setStoredUser(user as unknown as Record<string, unknown>)
    set({ user, isAuthenticated: true, isAdmin: user.role === 'admin', isLoading: false })
  },
  logout: () => {
    clearTokens()
    set({ user: null, isAuthenticated: false, isAdmin: false, isLoading: false })
  },
  initialize: () => {
    const token = getAccessToken()
    const stored = getStoredUser()
    if (token && stored) {
      const user = stored as unknown as User
      set({ user, isAuthenticated: true, isAdmin: user.role === 'admin', isLoading: false })
    } else {
      set({ isLoading: false })
    }
  },
}))
