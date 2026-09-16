import { Monitor, Moon, Sun, type LucideIcon } from 'lucide-react'
import type { ThemePreference } from '../../../shared/useTheme'
import './ThemeToggle.css'

type ThemeToggleProps = {
  preference: ThemePreference
  onCycle: () => void
  variant?: 'floating' | 'inline'
}

const THEME_META: Record<ThemePreference, { label: string; Icon: LucideIcon }> = {
  system: { label: 'Системная тема', Icon: Monitor },
  light: { label: 'Светлая тема', Icon: Sun },
  dark: { label: 'Тёмная тема', Icon: Moon },
}

// Cycles system -> light -> dark. 'floating' (default) is the fixed corner
// overlay used on LoginPage and the user-mode shell; the agent sidebar
// renders the 'inline' variant docked in its footer instead - see
// Sidebar.tsx.
export function ThemeToggle({ preference, onCycle, variant = 'floating' }: ThemeToggleProps) {
  const { label, Icon } = THEME_META[preference]

  return (
    <button
      type="button"
      className={`fb-theme-toggle${variant === 'inline' ? ' inline' : ''}`}
      onClick={onCycle}
      aria-label={`${label}. Нажмите, чтобы сменить`}
      title={label}
    >
      <Icon size={16} aria-hidden="true" />
    </button>
  )
}
