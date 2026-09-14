import { Headset, User, type LucideIcon } from 'lucide-react'
import type { AppMode } from '../hooks'
import './ModeSwitch.css'

type ModeSwitchProps = {
  mode: AppMode
  onToggle: () => void
}

const MODE_META: Record<AppMode, { label: string; switchTo: string; Icon: LucideIcon }> = {
  agent: { label: 'Режим агента', switchTo: 'Переключиться в режим пользователя', Icon: Headset },
  user: { label: 'Режим пользователя', switchTo: 'Переключиться в режим агента', Icon: User },
}

// Floating corner control that flips FeedbackApp between the full
// sidebar/all-views agent layout and the two-tab user layout - see
// FeedbackApp.tsx and useAppMode. Positioned like LoginPage's theme
// toggle (fixed corner overlay), but carries a label since which mode
// is active - and what clicking does - isn't inferable from a single
// icon the way the theme toggle's sun/moon/monitor is.
export function ModeSwitch({ mode, onToggle }: ModeSwitchProps) {
  const { label, switchTo, Icon } = MODE_META[mode]

  return (
    <button
      type="button"
      className="fb-mode-switch"
      onClick={onToggle}
      aria-label={`${label}. ${switchTo}`}
      title={switchTo}
    >
      <Icon size={15} aria-hidden="true" />
      <span className="fb-mode-switch-label">{label}</span>
    </button>
  )
}
