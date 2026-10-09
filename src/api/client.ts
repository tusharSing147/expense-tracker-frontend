import axios from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import { toast } from '@/components/ui/toast'
import { ApiError } from '../types/api'
import type { ApiErrorCode } from '../types/api'
import type { AccessTokenResponse } from '../types/auth'
import { tokenStore } from './tokenStore'

declare module 'axios' {
  interface AxiosRequestConfig {
    silentErrorToast?: boolean
  }
}

export const CSRF_HEADERS = { 'X-Requested-With': 'XMLHttpRequest' }

const REFRESH_ENDPOINT = '/auth/refresh'

const REFRESH_EXCLUDED_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout']

const RETRYABLE_401_CODES: ApiErrorCode[] = ['TOKEN_EXPIRED', 'UNAUTHORIZED']

const AUTH_FAILURE_CODES: ApiErrorCode[] = ['NO_REFRESH_TOKEN', 'TOKEN_REUSED']

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean
}

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

const authFailureListeners = new Set<() => void>()

let refreshPromise: Promise<string> | null = null

export function onAuthFailure(listener: () => void): () => void {
  authFailureListeners.add(listener)

  return () => {
    authFailureListeners.delete(listener)
  }
}

export function emitAuthFailure(): void {
  for (const listener of [...authFailureListeners]) {
    try {
      listener()
    } catch {
      // one failing listener must not break the caller
    }
  }
}

api.interceptors.request.use((config) => {
  const token = tokenStore.get()

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error
  }

  if (axios.isAxiosError(error)) {
    if (error.response) {
      return ApiError.fromBody(error.response.status, error.response.data)
    }

    return new ApiError('NETWORK_ERROR', 0, 'Network error — check your connection')
  }

  if (error instanceof Error) {
    return new ApiError('INTERNAL_ERROR', 0, error.message)
  }

  return new ApiError('INTERNAL_ERROR', 0, 'Something went wrong')
}

function requestPath(url: string | undefined): string | null {
  if (!url) {
    return null
  }

  return url.split('?')[0]
}

function isEndpoint(url: string | undefined, endpoint: string): boolean {
  const path = requestPath(url)

  return path !== null && path.endsWith(endpoint)
}

function isExcludedFromRefresh(url: string | undefined): boolean {
  return REFRESH_EXCLUDED_ENDPOINTS.some((endpoint) => isEndpoint(url, endpoint))
}

function hasAuthorization(config: RetriableConfig | undefined): boolean {
  return Boolean(config?.headers?.Authorization)
}

let sessionExpiredToastShown = false

function showApiErrorToast(error: ApiError): void {
  toast.add({
    type: 'error',
    title: error.code === 'NETWORK_ERROR' ? 'Network error' : 'Request failed',
    description: error.message,
  })
}

function showSessionExpiredToast(): void {
  if (sessionExpiredToastShown) {
    return
  }

  sessionExpiredToastShown = true

  toast.add({
    type: 'warning',
    title: 'Session expired',
    description: 'Please sign in again.',
  })
}

async function requestNewAccessToken(): Promise<string> {
  try {
    const response = await api.post<AccessTokenResponse>(REFRESH_ENDPOINT, undefined, {
      headers: CSRF_HEADERS,
    })

    const token = response.data.accessToken

    tokenStore.set(token)

    return token
  } catch (error) {
    const apiError = toApiError(error)

    if (apiError.status === 401) {
      tokenStore.clear()
      emitAuthFailure()
      showSessionExpiredToast()
    }

    throw apiError
  }
}

export function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = requestNewAccessToken().finally(() => {
      refreshPromise = null
    })
  }

  return refreshPromise
}

api.interceptors.response.use(
  (response) => {
    sessionExpiredToastShown = false

    return response
  },
  async (error: unknown) => {
    if (!axios.isAxiosError(error) || !error.response) {
      const apiError = toApiError(error)
      const silent = axios.isAxiosError(error) && Boolean(error.config?.silentErrorToast)

      if (!silent) {
        showApiErrorToast(apiError)
      }

      throw apiError
    }

    const config = error.config as RetriableConfig | undefined
    const status = error.response.status
    const parsed = ApiError.fromBody(status, error.response.data)
    const isRefreshAttempt = isEndpoint(config?.url, REFRESH_ENDPOINT)

    let failure = parsed
    let refreshFailed = false

    if (
      status === 401 &&
      config &&
      !config._retried &&
      !isExcludedFromRefresh(config.url) &&
      RETRYABLE_401_CODES.includes(parsed.code) &&
      hasAuthorization(config)
    ) {
      config._retried = true

      try {
        const token = await refreshAccessToken()

        if (config.headers) {
          config.headers.Authorization = `Bearer ${token}`
        }

        return await api.request(config)
      } catch (refreshError) {
        failure = toApiError(refreshError)
        refreshFailed = true
      }
    }

    const isAuthFailure =
      !isRefreshAttempt &&
      !refreshFailed &&
      hasAuthorization(config) &&
      AUTH_FAILURE_CODES.includes(failure.code)

    if (isAuthFailure) {
      emitAuthFailure()
      showSessionExpiredToast()
    } else if (!isRefreshAttempt && !refreshFailed && !config?.silentErrorToast) {
      showApiErrorToast(failure)
    }

    throw failure
  },
)

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string' && error.length > 0) {
    return error
  }

  return 'Something went wrong'
}
