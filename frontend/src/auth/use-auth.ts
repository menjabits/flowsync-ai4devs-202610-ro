import { createContext, useContext } from 'react'
import type { LoginInput, SignupInput } from '@/lib/auth-api'

export interface AuthContextValue {
  token: string | null
  login: (input: LoginInput) => Promise<void>
  signup: (input: SignupInput) => Promise<void>
  logout: () => Promise<void>
  /** Olvida la sesión local sin llamar al backend (p. ej., tras un 401). */
  clearSession: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return value
}
