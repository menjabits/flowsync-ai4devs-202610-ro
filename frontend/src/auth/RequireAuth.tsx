import { Navigate, Outlet } from 'react-router'
import { useAuth } from '@/auth/use-auth'

/** Rutas que exigen sesión: sin token, se va a `/login`. */
export function RequireAuth() {
  const { token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  return <Outlet />
}

/** Rutas solo para invitados: con sesión, se va a `/profile`. */
export function GuestOnly() {
  const { token } = useAuth()
  if (token) return <Navigate to="/profile" replace />
  return <Outlet />
}
