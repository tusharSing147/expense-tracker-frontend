import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { useAuth } from '../hooks/useAuth'
import { apiErrorMessage, fieldErrorsFromApi } from '../utils/errorMessages'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md gap-6 p-8">
        <CardHeader className="flex flex-col items-center gap-4 px-0 text-center">
          <div className="flex size-11 items-center justify-center rounded-xl bg-violet-600 text-lg font-semibold text-white">
            ₹
          </div>

          <div className="flex flex-col gap-1">
            <CardTitle
              role="heading"
              aria-level={1}
              className="text-2xl font-semibold text-gray-900 dark:text-gray-100"
            >
              Welcome back
            </CardTitle>

            <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
              Sign in to your expense tracker
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-6 px-0">
          {banner && (
            <Alert variant="destructive">
              <AlertDescription>{banner}</AlertDescription>
            </Alert>
          )}

          <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
            <Field data-invalid={fieldErrors.email ? true : undefined}>
              <FieldLabel htmlFor="email" className="gap-0.5">
                Email
                <span aria-hidden="true" className="text-destructive">
                  *
                </span>
              </FieldLabel>

              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                aria-invalid={Boolean(fieldErrors.email)}
                onChange={handleEmailChange}
              />

              {fieldErrors.email && <FieldError id="email-error">{fieldErrors.email}</FieldError>}
            </Field>

            <Field data-invalid={fieldErrors.password ? true : undefined}>
              <FieldLabel htmlFor="password" className="gap-0.5">
                Password
                <span aria-hidden="true" className="text-destructive">
                  *
                </span>
              </FieldLabel>

              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Your password"
                value={password}
                aria-invalid={Boolean(fieldErrors.password)}
                onChange={handlePasswordChange}
              />

              {fieldErrors.password && (
                <FieldError id="password-error">{fieldErrors.password}</FieldError>
              )}
            </Field>

            <Button type="submit" className="w-full" disabled={pending.login}>
              {pending.login && <Spinner className="size-4" />}
              Sign in
            </Button>
          </form>
        </CardContent>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-medium text-violet-600 hover:underline dark:text-violet-400"
          >
            Sign up
          </Link>
        </p>
      </Card>
    </div>
  )
}
