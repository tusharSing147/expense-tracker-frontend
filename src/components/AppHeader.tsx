import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
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
import { cn } from '@/lib/utils'
import { useAuth } from '../hooks/useAuth'
import { BottomNav } from './BottomNav'
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
  const [scrolled, setScrolled] = useState(() => window.scrollY > 0)

  const busy = pending.logout || pending.logoutAll

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 0)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

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
    <>
      <header
        className={cn(
          'h-[var(--nav-height)] border-b border-line bg-surface sticky top-0 z-40 transition-shadow duration-[var(--duration-base)]',
          scrolled && 'border-line-strong elevation-2'
        )}
      >
        <div className="mx-auto flex h-full w-full max-w-[var(--content-max)] items-center gap-[var(--space-5)] px-[var(--space-4)] sm:px-[var(--space-5)]">
          <Link to="/" className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="bg-accent text-ink-on-accent flex h-7 w-7 items-center justify-center rounded-sm text-sm font-semibold"
            >
              ₹
            </span>

            <span className="text-sm font-semibold text-ink">Expense Tracker</span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-1 sm:flex">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'inline-flex h-8 items-center rounded-full px-3 text-sm transition-colors duration-[var(--duration-fast)]',
                    isActive
                      ? 'bg-accent-soft font-medium text-accent-soft-ink'
                      : 'text-ink-muted hover:bg-surface-sunken hover:text-ink'
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <ThemeSwitcher />

            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label="Account menu"
                className="flex h-10 items-center gap-2 rounded-sm px-2 text-ink-muted transition-colors duration-[var(--duration-fast)] hover:bg-surface-sunken hover:text-ink"
              >
                <Avatar>
                  <AvatarFallback className="bg-accent-soft text-xs font-medium text-accent-soft-ink">
                    {user ? getInitials(user.name) : '?'}
                  </AvatarFallback>
                </Avatar>

                <span className="hidden text-sm text-ink-muted lg:inline">{user?.name}</span>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-ink">{user?.name}</span>

                  <span className="text-xs font-normal text-ink-muted">{user?.email}</span>
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

      <BottomNav />
    </>
  )
}
