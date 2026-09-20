import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from '../../../shared/useTheme'
import { useSidebarCollapsed, usePersistedMode } from '../hooks'
import { ModeSwitch } from './ModeSwitch'
import { Sidebar, type SidebarView } from './Sidebar'
import { ThemeToggle } from './ThemeToggle'

const SIDEBAR_VIEWS: SidebarView[] = ['all', 'bug', 'idea', 'review', 'systems', 'agents']

// Agent-mode shell: sidebar + main content, routed at /agent/*. Owns the
// sidebar-collapsed and theme preferences (only this shell uses them) and
// derives the active nav item from the URL instead of local view state -
// see FeedbackApp.tsx for the mode split and CLAUDE.md for why there's no
// router-agnostic view state left to keep in sync.
export function AgentShell() {
  usePersistedMode('agent')
  const { collapsed, toggleCollapsed } = useSidebarCollapsed()
  const { preference, cycleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()

  const segment = location.pathname.split('/')[2]
  const active = SIDEBAR_VIEWS.find((view) => view === segment) ?? 'all'

  return (
    <div className="fb-app">
      <Sidebar
        active={active}
        onNavigate={(view) => navigate(`/agent/${view}`)}
        collapsed={collapsed}
        onToggleCollapsed={toggleCollapsed}
        footer={
          <>
            <ModeSwitch mode="agent" onToggle={() => navigate('/user')} variant="inline" />
            <ThemeToggle preference={preference} onCycle={cycleTheme} variant="inline" />
          </>
        }
      />

      <main className="fb-main">
        <Outlet />
      </main>
    </div>
  )
}
