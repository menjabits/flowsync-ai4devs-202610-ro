import { apiRequest } from '@/lib/api'

/** Lo que expone `UserTransformer` en el backend. */
export interface User {
  id: number
  fullName: string | null
  email: string
  createdAt: string
  updatedAt: string | null
  initials: string
}

export interface AuthResponse {
  user: User
  token: string
}

/** Lo que exige `signupValidator`: `passwordConfirmation` es obligatorio. */
export interface SignupInput {
  fullName: string | null
  email: string
  password: string
  passwordConfirmation: string
}

export interface LoginInput {
  email: string
  password: string
}

export function signup(input: SignupInput) {
  return apiRequest<AuthResponse>('/auth/signup', {
    method: 'POST',
    body: input,
  })
}

export function login(input: LoginInput) {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: input,
  })
}

export function getProfile(token: string) {
  return apiRequest<User>('/account/profile', { token })
}

/** El backend responde `{ message }` sin envolver en `data`. */
export async function logout(token: string) {
  await apiRequest<unknown>('/account/logout', { method: 'POST', token })
}
