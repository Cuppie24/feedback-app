import { createContext } from 'react'
import type { AuthUser, LoginCredentials } from '../api/auth'

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

export interface AuthContextValue {
  status: AuthStatus
  user: AuthUser | null
  login: (credentials: LoginCredentials) => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
