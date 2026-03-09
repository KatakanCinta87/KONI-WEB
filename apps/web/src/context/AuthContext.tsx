import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../lib/axios'

interface User {
  id: string
  email: string
  fullName: string
  role: string
  mustChangePassword: boolean
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (accessToken: string, refreshToken: string, user: User) => void
  logout: () => void
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function normalizeUser(raw: any): User {
  return {
    id: String(raw?.id ?? ''),
    email: String(raw?.email ?? ''),
    fullName: String(raw?.fullName ?? raw?.name ?? 'User'),
    role: String(raw?.role ?? ''),
    mustChangePassword: Boolean(raw?.mustChangePassword ?? false),
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const login = (accessToken: string, refreshToken: string, userData: User) => {
    const normalizedUser = normalizeUser(userData)
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    localStorage.setItem('user', JSON.stringify(normalizedUser))
    setUser(normalizedUser)
  }

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken')
    if (refreshToken) {
      try {
        await api.post('/auth/logout', { refreshToken })
      } catch (error) {
        console.error('Logout API error:', error)
      }
    }
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setUser(null)
  }

  const checkAuth = async () => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser)
        setUser(normalizeUser(parsed))
      } catch {
        localStorage.removeItem('user')
        setUser(null)
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    checkAuth()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
