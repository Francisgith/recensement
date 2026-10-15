import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { RegisterPayload, User } from '../api/types'
import { authApi } from '../api/resources'

interface AuthContextValue {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, pass: string) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => void
  hasRole: (role: string) => boolean
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  hasRole: () => false,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('recensement_token'))
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('recensement_user')
    if (saved) {
      try {
        return JSON.parse(saved) as User
      } catch {
        return null
      }
    }
    return null
  })
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    let ignore = false
    const initAuth = async () => {
      const storedToken = localStorage.getItem('recensement_token')
      if (!storedToken) {
        if (!ignore) {
          setUser(null)
          setLoading(false)
        }
        return
      }

      try {
        const currentUser = await authApi.me()
        if (!ignore) {
          setUser(currentUser)
          localStorage.setItem('recensement_user', JSON.stringify(currentUser))
        }
      } catch {
        if (!ignore) {
          localStorage.removeItem('recensement_token')
          localStorage.removeItem('recensement_user')
          setToken(null)
          setUser(null)
        }
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    void initAuth()
    return () => {
      ignore = true
    }
  }, [token])

  const login = async (email: string, pass: string) => {
    const receivedToken = await authApi.login(email, pass)
    localStorage.setItem('recensement_token', receivedToken)
    setToken(receivedToken)
    const currentUser = await authApi.me()
    localStorage.setItem('recensement_user', JSON.stringify(currentUser))
    setUser(currentUser)
  }

  const register = async (payload: RegisterPayload) => {
    const res = await authApi.register(payload)
    localStorage.setItem('recensement_token', res.token)
    setToken(res.token)
    localStorage.setItem('recensement_user', JSON.stringify(res.user))
    setUser(res.user)
  }

  const logout = () => {
    localStorage.removeItem('recensement_token')
    localStorage.removeItem('recensement_user')
    setToken(null)
    setUser(null)
  }

  const hasRole = (role: string) => {
    return Boolean(user?.roles?.includes(role))
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
