import { ChartBar, LayoutDashboard, Receipt } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

const TAB_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/expenses', label: 'Expenses', icon: Receipt, end: false },
  { to: '/reports', label: 'Reports', icon: ChartBar, end: false },
]

export function BottomNav() {
  return (
    <nav
      aria-label="Primary"
      className="border-line bg-surface fixed inset-x-0 bottom-0 z-40 border-t pb-[env(safe-area-inset-bottom)] sm:hidden"
    >
      <div className="grid h-14 grid-cols-3">
        {TAB_ITEMS.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className="flex h-full flex-col items-center justify-center"
            >
              {({ isActive }) => (
                <span
                  className={cn(
                    'flex h-10 w-[calc(100%_-_16px)] flex-col items-center justify-center gap-1 rounded-full transition-colors duration-[var(--duration-fast)]',
                    isActive ? 'bg-accent-soft text-accent-soft-ink' : 'text-ink-muted'
                  )}
                >
                  <Icon aria-hidden="true" className="h-5 w-5" />
                  <span className="text-[11px] font-medium leading-none">{item.label}</span>
                </span>
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
