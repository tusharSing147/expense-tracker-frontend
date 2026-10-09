import { MonitorIcon, MoonIcon, SunIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme } from '../hooks/useTheme'

const THEME_OPTIONS = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

const THEME_ICONS = {
  light: SunIcon,
  dark: MoonIcon,
  system: MonitorIcon,
}

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const ThemeIcon = THEME_ICONS[theme]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Theme"
        title="Theme"
        render={
          <Button
            variant="ghost"
            className="h-10 w-10 rounded-sm text-ink-muted transition-colors duration-[var(--duration-fast)] hover:bg-surface-sunken hover:text-ink"
          />
        }
      >
        <ThemeIcon />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
          {THEME_OPTIONS.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
