import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from '../../../shared/useTheme'
import { usePersistedMode } from '../hooks'
import { ModeSwitch } from './ModeSwitch'
import { ThemeToggle } from './ThemeToggle'
import { UserTabBar, type UserView } from './UserTabBar'

const USER_VIEWS: UserView[] = ['create', 'mine', 'popular']

// User-mode shell: tab bar + main content, routed at /user/*. Mirrors
// AgentShell's structure (owns its own theme preference, derives the active
// tab from the URL) but with the floating theme/mode toggles and no
// sidebar - see FeedbackApp.tsx for the mode split.
export function UserShell() {
  usePersistedMode('user')
  const { preference, cycleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()

  const segment = location.pathname.split('/')[2]
  const active = USER_VIEWS.find((view) => view === segment) ?? 'create'

  return (
    <div className="fb-user-shell">
      <ThemeToggle preference={preference} onCycle={cycleTheme} />
      <ModeSwitch mode="user" onToggle={() => navigate('/agent')} />
      <UserTabBar active={active} onNavigate={(view) => navigate(`/user/${view}`)} />

      <main className="fb-user-content">
        <Outlet />
      </main>
    </div>
  )
}
