'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { AuthResponse } from '@/types'
import { authApi } from '@/lib/api'
import { saveAuth, clearAuth, getStoredUser, isAuthenticated } from '@/lib/auth'
import { toast } from 'sonner'

interface AuthUser {
  id: number
  email: string
  firstName: string
  lastName: string
  roles: string[]
}

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: { email: string; password: string; firstName: string; lastName: string; phone?: string }) => Promise<void>
  logout: () => void
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (isAuthenticated()) {
      const stored = getStoredUser()
      if (stored) setUser(stored)
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password })
    const auth: AuthResponse = res.data.data
    saveAuth(auth)
    setUser({ id: auth.userId, email: auth.email, firstName: auth.firstName, lastName: auth.lastName, roles: auth.roles })
    toast.success(`Welcome back, ${auth.firstName}!`)
    if (auth.roles.includes('ADMIN')) {
      router.push('/admin')
    } else {
      router.push('/')
    }
  }

  const register = async (data: Parameters<AuthContextType['register']>[0]) => {
    const res = await authApi.register(data)
    const auth: AuthResponse = res.data.data
    saveAuth(auth)
    setUser({ id: auth.userId, email: auth.email, firstName: auth.firstName, lastName: auth.lastName, roles: auth.roles })
    toast.success('Account created successfully!')
    router.push('/')
  }

  const logout = () => {
    clearAuth()
    setUser(null)
    // Wipe all cached query data so the next user sees a clean state
    queryClient.clear()
    toast.info('Logged out')
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{
      user, isLoading, login, register, logout,
      isAdmin: user?.roles?.includes('ADMIN') ?? false,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
