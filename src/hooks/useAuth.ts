import { createContext, useContext } from 'react'
import type { AuthContextValue, AuthStatus } from '../context/AuthContext'

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}

export type { AuthContextValue, AuthStatus }
