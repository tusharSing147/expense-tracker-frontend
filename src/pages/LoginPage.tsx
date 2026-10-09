import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { CircleAlertIcon } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { useAuth } from '../hooks/useAuth'
import { apiErrorMessage, fieldErrorsFromApi } from '../utils/errorMessages'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type LoginField = 'email' | 'password'

function validateCredentials(email: string, password: string): Record<string, string> {
  const errors: Record<string, string> = {}
  const trimmedEmail = email.trim()

  if (!trimmedEmail) {
    errors.email = 'Email is required'
  } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
    errors.email = 'Enter a valid email address'
  }

  if (!password) {
    errors.password = 'Password is required'
  }

  return errors
}

export function LoginPage() {
  const { login, pending } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [banner, setBanner] = useState('')

  const from = (location.state as { from?: string } | null)?.from ?? '/'

  function clearFieldError(field: string) {
    setFieldErrors((current) => {
      const next = { ...current }

      delete next[field]

      return next
    })
  }

  function handleEmailChange(event: ChangeEvent<HTMLInputElement>) {
    setEmail(event.target.value)
    clearFieldError('email')
    setBanner('')
  }

  function handlePasswordChange(event: ChangeEvent<HTMLInputElement>) {
    setPassword(event.target.value)
    clearFieldError('password')
    setBanner('')
  }

  function handleBlur(field: LoginField) {
    const message = validateCredentials(email, password)[field]

    if (message) {
      setFieldErrors((current) => ({ ...current, [field]: message }))
    } else {
      clearFieldError(field)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (pending.login) {
      return
    }

    const errors = validateCredentials(email, password)

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setBanner('')
      return
    }

    setFieldErrors({})
    setBanner('')

    try {
      await login({ email: email.trim(), password })
      navigate(from, { replace: true })
    } catch (error) {
      const apiFields = fieldErrorsFromApi(error)

      if (apiFields) {
        setFieldErrors(apiFields)
        return
      }

      setBanner(apiErrorMessage(error, 'Unable to sign in. Please try again.'))
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-4 py-[var(--space-6)]">
      <Card className="w-full max-w-[420px] gap-[var(--space-5)] p-[var(--space-6)]">
        <CardHeader className="flex flex-col items-center gap-4 px-0 text-center">
          <div
            aria-hidden="true"
            className="flex size-11 items-center justify-center rounded-sm bg-accent text-lg font-semibold text-ink-on-accent"
          >
            ₹
          </div>

          <div className="flex flex-col gap-1">
            <CardTitle
              role="heading"
              aria-level={1}
              className="font-display text-xl font-medium tracking-[var(--tracking-display)] text-ink"
            >
              Welcome back
            </CardTitle>

            <CardDescription className="mt-1 text-sm text-ink-muted">
              Sign in to your expense tracker
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-[var(--space-5)] px-0">
          {banner && (
            <Alert variant="destructive">
              <CircleAlertIcon aria-hidden="true" />
              <AlertDescription>{banner}</AlertDescription>
            </Alert>
          )}

          <form className="flex flex-col gap-[var(--space-4)]" onSubmit={handleSubmit} noValidate>
            <Field data-invalid={fieldErrors.email ? true : undefined}>
              <FieldLabel htmlFor="email">Email</FieldLabel>

              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                aria-invalid={Boolean(fieldErrors.email)}
                onChange={handleEmailChange}
                onBlur={() => handleBlur('email')}
              />

              {fieldErrors.email && <FieldError id="email-error">{fieldErrors.email}</FieldError>}
            </Field>

            <Field data-invalid={fieldErrors.password ? true : undefined}>
              <FieldLabel htmlFor="password">Password</FieldLabel>

              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Your password"
                value={password}
                aria-invalid={Boolean(fieldErrors.password)}
                onChange={handlePasswordChange}
                onBlur={() => handleBlur('password')}
              />

              {fieldErrors.password && (
                <FieldError id="password-error">{fieldErrors.password}</FieldError>
              )}
            </Field>

            <Button type="submit" className="h-[38px] w-full" disabled={pending.login}>
              {pending.login && <Spinner className="size-4" />}
              Sign in
            </Button>
          </form>
        </CardContent>

        <p className="text-center text-sm text-ink-muted">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-medium text-accent underline-offset-4 hover:text-accent-hover hover:underline"
          >
            Sign up
          </Link>
        </p>
      </Card>
    </div>
  )
}
