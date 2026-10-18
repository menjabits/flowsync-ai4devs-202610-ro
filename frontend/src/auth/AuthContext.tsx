import { useCallback, useMemo, useState, type ReactNode } from 'react'
import * as authApi from '@/lib/auth-api'
import type { LoginInput, SignupInput } from '@/lib/auth-api'
import { AuthContext, type AuthContextValue } from '@/auth/use-auth'

const TOKEN_KEY = 'flowsync.token'

function readToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

function writeToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // Sin almacenamiento disponible: la sesión vive solo en memoria.
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(readToken)

  const saveToken = useCallback((next: string | null) => {
    writeToken(next)
    setToken(next)
  }, [])

  const login = useCallback(
    async (input: LoginInput) => {
      const { token } = await authApi.login(input)
      saveToken(token)
    },
    [saveToken],
  )

  const signup = useCallback(
    async (input: SignupInput) => {
      const { token } = await authApi.signup(input)
      saveToken(token)
    },
    [saveToken],
  )

  const clearSession = useCallback(() => saveToken(null), [saveToken])

  const logout = useCallback(async () => {
    try {
      if (token) await authApi.logout(token)
    } finally {
      // Aunque el backend falle, la sesión local se cierra.
      saveToken(null)
    }
  }, [token, saveToken])

  const value = useMemo<AuthContextValue>(
    () => ({ token, login, signup, logout, clearSession }),
    [token, login, signup, logout, clearSession],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
