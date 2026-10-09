import type { AuthResponse, LoginInput, RegisterInput, User } from '../types/auth'
import { api, CSRF_HEADERS, emitAuthFailure } from './client'
import { tokenStore } from './tokenStore'

export async function register(data: RegisterInput): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/register', data, { silentErrorToast: true })

  tokenStore.set(response.data.accessToken)

  return response.data
}

export async function login(data: LoginInput): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/login', data, { silentErrorToast: true })

  tokenStore.set(response.data.accessToken)

  return response.data
}

export { refreshAccessToken as refresh } from './client'

export async function logout(): Promise<void> {
  try {
    await api.post<void>('/auth/logout', undefined, { headers: CSRF_HEADERS })
  } finally {
    tokenStore.clear()
    emitAuthFailure()
  }
}

export async function logoutAll(): Promise<void> {
  await api.post<void>('/auth/logout-all')

  tokenStore.clear()
  emitAuthFailure()
}

export async function getMe(): Promise<User> {
  const response = await api.get<{ user: User }>('/auth/me')

  return response.data.user
}
