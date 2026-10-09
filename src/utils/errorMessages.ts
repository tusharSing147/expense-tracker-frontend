import type { ApiError, ApiErrorCode } from '../types/api'

const CODE_MESSAGES: Partial<Record<ApiErrorCode, string>> = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_TAKEN: 'An account with this email already exists',
  RATE_LIMITED: 'Too many attempts. Please wait a few minutes and try again.',
  NETWORK_ERROR: 'Could not reach the server. Check your connection and try again.',
}

function asApiError(error: unknown): ApiError | null {
  if (typeof error !== 'object' || error === null) {
    return null
  }

  const candidate = error as { code?: unknown; message?: unknown }

  if (typeof candidate.code !== 'string' || typeof candidate.message !== 'string') {
    return null
  }

  return error as ApiError
}

export function apiErrorMessage(error: unknown, fallback: string): string {
  const apiError = asApiError(error)

  if (!apiError) {
    return fallback
  }

  const mapped = CODE_MESSAGES[apiError.code]

  if (mapped) {
    return mapped
  }

  return apiError.message || fallback
}

export function fieldErrorsFromApi(error: unknown): Record<string, string> | null {
  const apiError = asApiError(error)

  if (!apiError || apiError.code !== 'VALIDATION_ERROR' || !apiError.details) {
    return null
  }

  return Object.fromEntries(
    apiError.details.map((detail): [string, string] => [detail.field, detail.message]),
  )
}
