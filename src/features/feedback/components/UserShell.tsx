import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from '../../../shared/useTheme'
import { hasUnreadMessages } from '../data'
import { usePersistedMode, useSearchPalette } from '../hooks'
import type { Ticket } from '../types'
import { ModeSwitch } from './ModeSwitch'
import { SearchPalette } from './SearchPalette'
import { ThemeToggle } from './ThemeToggle'
import { UserTabBar, type UserView } from './UserTabBar'

const USER_VIEWS: UserView[] = ['create', 'mine', 'popular']

type UserShellProps = {
  tickets: Ticket[]
  onSelectTicket: (ticket: Ticket) => void
}

// User-mode shell: tab bar + main content, routed at /user/*. Mirrors
// AgentShell's structure (owns its own theme preference, derives the active
// tab from the URL) but with the floating theme/mode toggles and no
// sidebar - see FeedbackApp.tsx for the mode split. Also owns the global
// search palette (Ctrl/Cmd+K): it lives in the shell rather than a view
// since UserTabBar leaves no room for a persistent search field, and the
// shell wraps every /user/* route so the shortcut works everywhere -
// see SearchPalette.tsx.
export function UserShell({ tickets, onSelectTicket }: UserShellProps) {
  usePersistedMode('user')
  const { preference, cycleTheme } = useTheme()
  const { open, query, setQuery, openPalette, closePalette } = useSearchPalette()
  const location = useLocation()
  const navigate = useNavigate()

  const segment = location.pathname.split('/')[2]
  const active = USER_VIEWS.find((view) => view === segment) ?? 'create'

  return (
    <div className="fb-user-shell">
      <SearchPalette
        open={open}
        query={query}
        onQueryChange={setQuery}
        onOpen={openPalette}
        onClose={closePalette}
        tickets={tickets}
        onSelectTicket={(ticket) => {
          closePalette()
          onSelectTicket(ticket)
        }}
      />
      <ThemeToggle preference={preference} onCycle={cycleTheme} />
      <ModeSwitch mode="user" onToggle={() => navigate('/agent')} />
      <UserTabBar
        active={active}
        onNavigate={(view) => navigate(`/user/${view}`)}
        notifications={{ mine: tickets.some((ticket) => ticket.mine && hasUnreadMessages(ticket)) }}
      />

      <main className="fb-user-content">
        <Outlet />
      </main>
    </div>
  )
}
