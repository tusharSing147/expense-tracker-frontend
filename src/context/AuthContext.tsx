import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import {
  getMe,
  login as loginApi,
  logout as logoutApi,
  logoutAll as logoutAllApi,
  refresh,
  register as registerApi,
} from '../api/auth'
import { toast } from '@/components/ui/toast'
import { onAuthFailure } from '../api/client'
import { tokenStore } from '../api/tokenStore'
import { AuthContext } from '../hooks/useAuth'
import type { LoginInput, RegisterInput, User } from '../types/auth'

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous'

export interface AuthContextValue {
  status: AuthStatus
  user: User | null
  login(input: LoginInput): Promise<void>
  register(input: RegisterInput): Promise<void>
  logout(): Promise<void>
  logoutAll(): Promise<void>
  pending: { login: boolean; register: boolean; logout: boolean; logoutAll: boolean }
}

interface AuthProviderProps {
  children: ReactNode
}

let bootstrapInflight: Promise<User | null> | null = null

async function restoreSession(): Promise<User | null> {
  try {
    if (!tokenStore.get()) {
      await refresh()
    }

    return await getMe()
  } catch {
    return null
  }
}

function bootstrap(): Promise<User | null> {
  if (!bootstrapInflight) {
    bootstrapInflight = restoreSession().finally(() => {
      bootstrapInflight = null
    })
  }

  return bootstrapInflight
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [user, setUser] = useState<User | null>(null)

  const loginMutation = useMutation({
    mutationFn: (input: LoginInput) => loginApi(input),
    onSuccess: (data) => {
      toast.add({
        type: 'success',
        title: 'Signed in',
        description: `Welcome back, ${data.user.name}`,
      })
    },
  })

  const registerMutation = useMutation({
    mutationFn: (input: RegisterInput) => registerApi(input),
    onSuccess: () => {
      toast.add({
        type: 'success',
        title: 'Account created',
      })
    },
  })

  const logoutMutation = useMutation({
    mutationFn: () => logoutApi(),
    onSuccess: () => {
      toast.add({
        type: 'success',
        title: 'Signed out',
      })
    },
  })

  const logoutAllMutation = useMutation({
    mutationFn: () => logoutAllApi(),
    onSuccess: () => {
      toast.add({
        type: 'success',
        title: 'Signed out of all devices',
      })
    },
  })

  useEffect(() => {
    let active = true

    bootstrap().then((restored) => {
      if (!active) {
        return
      }

      if (restored) {
        setUser(restored)
        setStatus('authenticated')
      } else {
        setUser(null)
        setStatus('anonymous')
      }
    })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthFailure(() => {
      setUser(null)
      setStatus('anonymous')
    })

    return unsubscribe
  }, [])

  async function login(input: LoginInput): Promise<void> {
    const response = await loginMutation.mutateAsync(input)

    setUser(response.user)
    setStatus('authenticated')
  }

  async function register(input: RegisterInput): Promise<void> {
    const response = await registerMutation.mutateAsync(input)

    setUser(response.user)
    setStatus('authenticated')
  }

  async function logout(): Promise<void> {
    await logoutMutation.mutateAsync()

    setUser(null)
    setStatus('anonymous')
  }

  async function logoutAll(): Promise<void> {
    await logoutAllMutation.mutateAsync()

    setUser(null)
    setStatus('anonymous')
  }

  const value: AuthContextValue = {
    status,
    user,
    login,
    register,
    logout,
    logoutAll,
    pending: {
      login: loginMutation.isPending,
      register: registerMutation.isPending,
      logout: logoutMutation.isPending,
      logoutAll: logoutAllMutation.isPending,
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
