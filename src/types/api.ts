const API_ERROR_CODES = [
  'VALIDATION_ERROR',
  'UNAUTHORIZED',
  'TOKEN_EXPIRED',
  'INVALID_CREDENTIALS',
  'NO_REFRESH_TOKEN',
  'TOKEN_REUSED',
  'CSRF_REJECTED',
  'NOT_FOUND',
  'EMAIL_TAKEN',
  'BUDGET_EXISTS',
  'ACCOUNT_LOCKED',
  'RATE_LIMITED',
  'INTERNAL_ERROR',
  'NOT_READY',
  'CONFLICT',
  'NETWORK_ERROR',
] as const

export type ApiErrorCode = (typeof API_ERROR_CODES)[number]

export interface ErrorDetail {
  field: string
  message: string
}

export interface ApiErrorBody {
  error: {
    code: ApiErrorCode
    message: string
    details?: ErrorDetail[]
  }
}

const STATUS_FALLBACKS: Record<number, { code: ApiErrorCode; message: string }> = {
  401: { code: 'UNAUTHORIZED', message: 'Unauthorized' },
  403: { code: 'CSRF_REJECTED', message: 'Forbidden' },
  404: { code: 'NOT_FOUND', message: 'Not found' },
  429: { code: 'RATE_LIMITED', message: 'Too many requests' },
}

const DEFAULT_FALLBACK: { code: ApiErrorCode; message: string } = {
  code: 'INTERNAL_ERROR',
  message: 'The server could not complete this request. Try again.',
}

function fallbackFor(status: number): { code: ApiErrorCode; message: string } {
  return STATUS_FALLBACKS[status] ?? DEFAULT_FALLBACK
}

function isApiErrorCode(value: string): value is ApiErrorCode {
  return (API_ERROR_CODES as readonly string[]).includes(value)
}

function parseDetails(value: unknown): ErrorDetail[] | undefined {
  if (!Array.isArray(value)) {
    return undefined
  }

  const details: ErrorDetail[] = []

  for (const item of value) {
    if (typeof item !== 'object' || item === null) {
      continue
    }

    const detail = item as { field?: unknown; message?: unknown }

    if (typeof detail.field === 'string' && typeof detail.message === 'string') {
      details.push({ field: detail.field, message: detail.message })
    }
  }

  return details.length > 0 ? details : undefined
}

function parseErrorBody(body: unknown): ApiErrorBody['error'] | null {
  if (typeof body !== 'object' || body === null) {
    return null
  }

  const envelope = (body as { error?: unknown }).error

  if (typeof envelope !== 'object' || envelope === null) {
    return null
  }

  const { code, message, details } = envelope as { code?: unknown; message?: unknown; details?: unknown }

  if (typeof code !== 'string' || !isApiErrorCode(code)) {
    return null
  }

  return {
    code,
    message: typeof message === 'string' ? message : '',
    details: parseDetails(details),
  }
}

export class ApiError extends Error {
  readonly code: ApiErrorCode
  readonly status: number
  readonly details?: ErrorDetail[]

  constructor(code: ApiErrorCode, status: number, message: string, details?: ErrorDetail[]) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
    this.details = details
  }

  static fromBody(status: number, body: unknown): ApiError {
    const parsed = parseErrorBody(body)

    if (!parsed) {
      const fallback = fallbackFor(status)
      return new ApiError(fallback.code, status, fallback.message)
    }

    const message = parsed.message || fallbackFor(status).message

    return new ApiError(parsed.code, status, message, parsed.details)
  }
}
