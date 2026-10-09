import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { useAuth } from '../hooks/useAuth'
import { ApiError } from '../types/api'
import { fieldErrorsFromApi } from '../utils/errorMessages'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateRegistration(
  name: string,
  email: string,
  password: string,
  confirmPassword: string,
): Record<string, string> {
  const errors: Record<string, string> = {}
  const trimmedName = name.trim()
  const trimmedEmail = email.trim()
  const lowerName = trimmedName.toLowerCase()
  const lowerEmail = trimmedEmail.toLowerCase()
  const lowerPassword = password.toLowerCase()

  if (!trimmedName) {
    errors.name = 'Name is required'
  } else if (trimmedName.length < 2 || trimmedName.length > 100) {
    errors.name = 'Name must be between 2 and 100 characters'
  }

  if (!trimmedEmail) {
    errors.email = 'Email is required'
  } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
    errors.email = 'Enter a valid email address'
  }

  if (password.length < 8 || password.length > 72) {
    errors.password = 'Password must be between 8 and 72 characters'
  } else if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    errors.password = 'Password must include at least one letter and one digit'
  } else if (lowerPassword === lowerName || lowerPassword === lowerEmail) {
    errors.password = 'Password must not match your name or email'
  }

  if (confirmPassword !== password) {
    errors.confirmPassword = 'Passwords do not match'
  }

  return errors
}

export function RegisterPage() {
  const { register, pending } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [banner, setBanner] = useState('')

  function clearFieldError(field: string) {
    setFieldErrors((current) => {
      const next = { ...current }

      delete next[field]

      return next
    })
  }

  function handleNameChange(event: ChangeEvent<HTMLInputElement>) {
    setName(event.target.value)
    clearFieldError('name')
    setBanner('')
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

  function handleConfirmPasswordChange(event: ChangeEvent<HTMLInputElement>) {
    setConfirmPassword(event.target.value)
    clearFieldError('confirmPassword')
    setBanner('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (pending.register) {
      return
    }

    const errors = validateRegistration(name, email, password, confirmPassword)

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setBanner('')
      return
    }

    setFieldErrors({})
    setBanner('')

    try {
      await register({ name: name.trim(), email: email.trim(), password })
      navigate('/', { replace: true })
    } catch (error) {
      const apiFields = fieldErrorsFromApi(error)

      if (apiFields) {
        setFieldErrors(apiFields)
        return
      }

      if (error instanceof ApiError && error.code === 'EMAIL_TAKEN') {
        setFieldErrors({ email: 'An account with this email already exists' })
        setBanner('An account with this email already exists.')
        return
      }

      if (error instanceof ApiError && error.code === 'RATE_LIMITED') {
        setBanner('Too many attempts — please wait a few minutes.')
        return
      }

      setBanner(
        error instanceof Error && error.message
          ? error.message
          : 'Unable to create your account. Please try again.',
      )
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
              Create your account
            </CardTitle>

            <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
              Start tracking expenses in minutes
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
            <Field data-invalid={fieldErrors.name ? true : undefined}>
              <FieldLabel htmlFor="name" className="gap-0.5">
                Name
                <span aria-hidden="true" className="text-destructive">
                  *
                </span>
              </FieldLabel>

              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Your name"
                value={name}
                aria-invalid={Boolean(fieldErrors.name)}
                onChange={handleNameChange}
              />

              {fieldErrors.name && <FieldError id="name-error">{fieldErrors.name}</FieldError>}
            </Field>

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
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={password}
                aria-invalid={Boolean(fieldErrors.password)}
                onChange={handlePasswordChange}
              />

              {fieldErrors.password && (
                <FieldError id="password-error">{fieldErrors.password}</FieldError>
              )}
            </Field>

            <Field data-invalid={fieldErrors.confirmPassword ? true : undefined}>
              <FieldLabel htmlFor="confirmPassword" className="gap-0.5">
                Confirm password
                <span aria-hidden="true" className="text-destructive">
                  *
                </span>
              </FieldLabel>

              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Repeat your password"
                value={confirmPassword}
                aria-invalid={Boolean(fieldErrors.confirmPassword)}
                onChange={handleConfirmPasswordChange}
              />

              {fieldErrors.confirmPassword && (
                <FieldError id="confirmPassword-error">{fieldErrors.confirmPassword}</FieldError>
              )}
            </Field>

            <Button type="submit" className="w-full" disabled={pending.register}>
              {pending.register && <Spinner className="size-4" />}
              Create account
            </Button>
          </form>
        </CardContent>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-violet-600 hover:underline dark:text-violet-400"
          >
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  )
}
