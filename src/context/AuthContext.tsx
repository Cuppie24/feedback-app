import { useCallback, useEffect, useState, type ReactNode } from 'react'
import {
  checkAuthStatus,
  login as loginRequest,
  type AuthUser,
  type LoginCredentials,
} from '../api/auth'
import { AuthContext, type AuthStatus } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    let cancelled = false

    const handleUnauthorized = () => {
      setUser(null)
      setStatus('unauthenticated')
    }

    window.addEventListener('auth:unauthorized', handleUnauthorized)

    checkAuthStatus()
      .then(() => {
        if (cancelled) return
        setStatus('authenticated')
      })
      .catch(() => {
        if (cancelled) return
        setUser(null)
        setStatus('unauthenticated')
      })

    return () => {
      cancelled = true
      window.removeEventListener('auth:unauthorized', handleUnauthorized)
    }
  }, [])

  const login = useCallback(async (credentials: LoginCredentials) => {
    const loggedInUser = await loginRequest(credentials)
    setUser(loggedInUser)
    setStatus('authenticated')
  }, [])

  return (
    <AuthContext.Provider value={{ status, user, login }}>
      {children}
    </AuthContext.Provider>
  )
}
