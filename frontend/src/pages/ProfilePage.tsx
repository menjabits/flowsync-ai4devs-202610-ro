import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '@/auth/use-auth'
import { ApiError, NETWORK_ERROR_STATUS } from '@/lib/api'
import { getProfile, type User } from '@/lib/auth-api'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type State =
  | { status: 'loading' }
  | { status: 'ready'; user: User }
  | { status: 'error'; message: string }

export function ProfilePage() {
  const { token, logout, clearSession } = useAuth()
  const navigate = useNavigate()
  const [state, setState] = useState<State>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    if (!token) return
    let cancelled = false

    getProfile(token)
      .then((user) => {
        if (!cancelled) setState({ status: 'ready', user })
      })
      .catch((error: unknown) => {
        if (cancelled) return
        if (error instanceof ApiError && error.status === 401) {
          // Token caducado o borrado: se cierra la sesión local y RequireAuth lleva a /login.
          clearSession()
          return
        }
        setState({
          status: 'error',
          message:
            error instanceof ApiError && error.status === NETWORK_ERROR_STATUS
              ? error.message
              : 'No se ha podido cargar tu perfil.',
        })
      })

    return () => {
      cancelled = true
    }
  }, [token, clearSession, attempt])

  function retry() {
    setState({ status: 'loading' })
    setAttempt((n) => n + 1)
  }

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await logout()
    } catch {
      // logout() ya ha limpiado la sesión local aunque el backend falle.
    }
    navigate('/login', { replace: true })
  }

  return (
    <main className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Tu perfil</CardTitle>
          <CardDescription>Datos de tu cuenta en FlowSync.</CardDescription>
        </CardHeader>
        <CardContent>
          {state.status === 'loading' && (
            <p className="text-sm text-muted-foreground">Cargando…</p>
          )}
          {state.status === 'error' && (
            <div className="flex flex-col gap-3">
              <Alert variant="destructive">
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
              <Button variant="outline" onClick={retry}>
                Reintentar
              </Button>
            </div>
          )}
          {state.status === 'ready' && (
            <div className="flex items-center gap-4">
              <div
                aria-hidden="true"
                className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-medium text-primary-foreground"
              >
                {state.user.initials}
              </div>
              <dl className="grid gap-1 text-sm">
                {state.user.fullName && (
                  <div>
                    <dt className="sr-only">Nombre</dt>
                    <dd className="font-medium">{state.user.fullName}</dd>
                  </div>
                )}
                <div>
                  <dt className="sr-only">Email</dt>
                  <dd>{state.user.email}</dd>
                </div>
                <div>
                  <dt className="sr-only">Miembro desde</dt>
                  <dd className="text-muted-foreground">
                    Miembro desde{' '}
                    {new Date(state.user.createdAt).toLocaleDateString(
                      'es-ES',
                      {
                        dateStyle: 'long',
                      },
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </CardContent>
        <CardFooter className="mt-6">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}
          </Button>
        </CardFooter>
      </Card>
    </main>
  )
}
