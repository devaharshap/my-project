import Cookies from 'js-cookie'
import { AuthResponse } from '@/types'

const TOKEN_KEY = 'accessToken'
const REFRESH_KEY = 'refreshToken'
const USER_KEY = 'user'

export function saveAuth(auth: AuthResponse) {
  Cookies.set(TOKEN_KEY, auth.accessToken, { expires: 1 })
  Cookies.set(REFRESH_KEY, auth.refreshToken, { expires: 7 })
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_KEY, JSON.stringify({
      id: auth.userId, email: auth.email,
      firstName: auth.firstName, lastName: auth.lastName,
      roles: auth.roles,
    }))
  }
}

export function clearAuth() {
  Cookies.remove(TOKEN_KEY)
  Cookies.remove(REFRESH_KEY)
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USER_KEY)
  }
}

export function getStoredUser() {
  if (typeof window === 'undefined') return null
  const data = localStorage.getItem(USER_KEY)
  return data ? JSON.parse(data) : null
}

export function getAccessToken(): string | undefined {
  return Cookies.get(TOKEN_KEY)
}

export function isAuthenticated(): boolean {
  return !!Cookies.get(TOKEN_KEY)
}

export function isAdmin(roles?: string[]): boolean {
  return !!roles?.includes('ADMIN')
}
