import type { ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Spinner } from '@/components/ui/spinner'
import { useAuth } from '../hooks/useAuth'

function LoadingScreen() {
  return (
    <div className="flex min-h-dvh items-center justify-center text-gray-400 dark:text-gray-500">
      <Spinner className="size-8" />
    </div>
  )
}

export function AuthGuard() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return <LoadingScreen />
  }

  if (status === 'anonymous') {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname + location.search }}
        replace
      />
    )
  }

  return <Outlet />
}

export function PublicOnlyGuard({ children }: { children: ReactNode }) {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return <LoadingScreen />
  }

  if (status === 'authenticated') {
    const from = (location.state as { from?: string } | null)?.from ?? '/'

    return <Navigate to={from} replace />
  }

  return <>{children}</>
}
