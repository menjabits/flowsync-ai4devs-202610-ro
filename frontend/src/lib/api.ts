/**
 * Cliente HTTP mínimo para la API de FlowSync.
 *
 * El backend envuelve las respuestas en `{ data: ... }` y devuelve los errores
 * como `{ errors: [{ message, rule?, field? }] }`. Este módulo desempaqueta
 * `data` y convierte cualquier fallo (incluido uno de red) en un `ApiError`.
 */

export interface ApiFieldError {
  message: string
  rule?: string
  field?: string
}

export class ApiError extends Error {
  readonly status: number
  readonly errors: ApiFieldError[]

  constructor(status: number, errors: ApiFieldError[]) {
    super(errors[0]?.message ?? 'Error inesperado')
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

/** `status` de un `ApiError` cuando el servidor no responde. */
export const NETWORK_ERROR_STATUS = 0

interface RequestOptions {
  method?: 'GET' | 'POST'
  body?: unknown
  token?: string | null
}

export async function apiRequest<T>(
  path: string,
  { method = 'GET', body, token }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  let response: Response
  try {
    response = await fetch(`/api/v1${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(NETWORK_ERROR_STATUS, [
      {
        message:
          'No se puede conectar con el servidor. Inténtalo de nuevo en unos segundos.',
      },
    ])
  }

  const payload: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    const errors =
      payload &&
      typeof payload === 'object' &&
      'errors' in payload &&
      Array.isArray(payload.errors)
        ? (payload.errors as ApiFieldError[])
        : []
    throw new ApiError(response.status, errors)
  }

  return (payload as { data: T }).data
}
