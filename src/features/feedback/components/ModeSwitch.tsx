import { Headset, User, type LucideIcon } from 'lucide-react'
import type { AppMode } from '../hooks'
import './ModeSwitch.css'

type ModeSwitchProps = {
  mode: AppMode
  onToggle: () => void
  variant?: 'floating' | 'inline'
}

const MODE_META: Record<AppMode, { label: string; switchTo: string; Icon: LucideIcon }> = {
  agent: { label: 'Режим агента', switchTo: 'Переключиться в режим пользователя', Icon: Headset },
  user: { label: 'Режим пользователя', switchTo: 'Переключиться в режим агента', Icon: User },
}

// Flips FeedbackApp between the full sidebar/all-views agent layout and
// the two-tab user layout - see FeedbackApp.tsx and useAppMode. 'floating'
// (default) is a fixed corner overlay, like LoginPage's theme toggle, used
// in the user-mode shell (which has no sidebar to dock into). 'inline'
// docks in the agent sidebar's footer instead - see Sidebar.tsx. Carries a
// label either way since which mode is active - and what clicking does -
// isn't inferable from a single icon the way the theme toggle's is.
export function ModeSwitch({ mode, onToggle, variant = 'floating' }: ModeSwitchProps) {
  const { label, switchTo, Icon } = MODE_META[mode]

  return (
    <button
      type="button"
      className={`fb-mode-switch${variant === 'inline' ? ' inline' : ''}`}
      onClick={onToggle}
      aria-label={`${label}. ${switchTo}`}
      title={switchTo}
    >
      <Icon size={15} aria-hidden="true" />
      <span className="fb-mode-switch-label">{label}</span>
    </button>
  )
}
