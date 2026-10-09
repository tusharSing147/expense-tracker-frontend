import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Spinner } from '@/components/ui/spinner'
import { useAuth } from '../hooks/useAuth'
import { ThemeSwitcher } from './ThemeSwitcher'

const NAV_LINKS = [
  { to: '/', label: 'Dashboard' },
  { to: '/expenses', label: 'Expenses' },
  { to: '/reports', label: 'Reports' },
]

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

export function AppHeader() {
  const { user, logout, logoutAll, pending } = useAuth()
  const navigate = useNavigate()
  const [, setLogoutError] = useState<string | null>(null)

  const busy = pending.logout || pending.logoutAll

  async function handleLogout() {
    if (busy) {
      return
    }

    try {
      await logout()
      navigate('/login', { replace: true })
    } catch (error) {
      setLogoutError(error instanceof Error ? error.message : 'Unable to log out')
    }
  }

  async function handleLogoutAll() {
    if (busy) {
      return
    }

    try {
      await logoutAll()
      navigate('/login', { replace: true })
    } catch (error) {
      setLogoutError(error instanceof Error ? error.message : 'Unable to log out')
    }
  }

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-gray-950/80">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-violet-600 text-sm font-semibold text-white">
            ₹
          </div>

          <span className="font-semibold text-gray-900 dark:text-gray-100">Expense Tracker</span>

          <nav className="ml-4 flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `rounded-md px-2.5 py-1.5 text-sm transition-colors ${
                    isActive
                      ? 'bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                      : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeSwitcher />

          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Account menu"
              className="flex items-center gap-2 rounded-lg px-1.5 py-1 outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <Avatar>
                <AvatarFallback className="bg-violet-600 font-semibold text-white">
                  {user ? getInitials(user.name) : '?'}
                </AvatarFallback>
              </Avatar>

              <span className="hidden text-sm font-medium text-gray-900 sm:block dark:text-gray-100">
                {user?.name}
              </span>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-foreground">{user?.name}</span>

                <span className="text-xs font-normal text-muted-foreground">{user?.email}</span>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem closeOnClick={false} disabled={busy} onClick={handleLogout}>
                {pending.logout && <Spinner />}
                Log out
              </DropdownMenuItem>

              <DropdownMenuItem closeOnClick={false} disabled={busy} onClick={handleLogoutAll}>
                {pending.logoutAll && <Spinner />}
                Log out of all devices
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
