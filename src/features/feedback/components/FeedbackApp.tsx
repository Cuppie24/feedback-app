import { useState } from 'react'
import { Monitor, Moon, Sun } from 'lucide-react'
import { useAppMode, useFeedbackTickets, useSidebarCollapsed } from '../hooks'
import { useTheme } from '../../../shared/useTheme'
import { AgentsView } from './AgentsView'
import { AllTicketsView } from './AllTicketsView'
import { CategoryTicketsView } from './CategoryTicketsView'
import { CreateFeedbackView } from './CreateFeedbackView'
import { ModeSwitch } from './ModeSwitch'
import { MyTicketsView } from './MyTicketsView'
import { PopularTicketsView } from './PopularTicketsView'
import { Sidebar, type SidebarView } from './Sidebar'
import { SystemsView } from './SystemsView'
import { SuggestionDetailView } from './SuggestionDetailView'
import { UserTabBar, type UserView } from './UserTabBar'
import './FeedbackApp.css'

const THEME_META = {
  system: { label: 'Системная тема', Icon: Monitor },
  light: { label: 'Светлая тема', Icon: Sun },
  dark: { label: 'Тёмная тема', Icon: Moon },
} as const

// No router yet (see CLAUDE.md) - navigation between the feedback screens
// is local view state, same pattern App.tsx already uses for
// loading/login/signed-in.
//
// The app has two modes, toggled by the floating ModeSwitch and
// persisted by useAppMode: 'agent' is the sidebar/category-views shell
// below, for support staff triaging every ticket; 'user' is a separate
// tabbed shell (create / my tickets / popular) for a regular employee -
// creating feedback and browsing "my tickets" are user-mode-only, not
// duplicated in agent mode. Rendered as its own early-return branch
// rather than threaded through the agent layout's view state.
export function FeedbackApp() {
  const { tickets, toggleLike, updateSystem, updateStatus, addComment, editComment, deleteComment, addTicket } = useFeedbackTickets()
  const { collapsed, toggleCollapsed } = useSidebarCollapsed()
  const { mode, toggleMode } = useAppMode()
  const { preference, cycleTheme } = useTheme()
  const [view, setView] = useState<SidebarView>('all')
  const [userView, setUserView] = useState<UserView>('create')
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const selectedTicket = tickets.find((ticket) => ticket.id === selectedTicketId)
  const { label: themeLabel, Icon: ThemeIcon } = THEME_META[preference]

  const themeToggle = (
    <button
      type="button"
      className="fb-theme-toggle"
      onClick={cycleTheme}
      aria-label={`${themeLabel}. Нажмите, чтобы сменить`}
      title={themeLabel}
    >
      <ThemeIcon size={16} aria-hidden="true" />
    </button>
  )

  const openTicket = (ticket: (typeof tickets)[number]) => {
    if (ticket.category === 'idea') setSelectedTicketId(ticket.id)
  }

  if (mode === 'user') {
    return (
      <div className="fb-user-shell">
        {themeToggle}
        <ModeSwitch mode={mode} onToggle={toggleMode} />
        <UserTabBar active={userView} onNavigate={setUserView} />

        <main className="fb-user-content">
          {selectedTicket?.category === 'idea' && (
            <SuggestionDetailView
              ticket={selectedTicket}
              onBack={() => setSelectedTicketId(null)}
              onToggleLike={() => toggleLike(selectedTicket.id)}
              onStatusChange={(status) => updateStatus(selectedTicket.id, status)}
              onAddComment={(text, replyToId, attachments) => addComment(selectedTicket.id, text, replyToId, attachments)}
              onEditComment={(commentId, text) => editComment(selectedTicket.id, commentId, text)}
              onDeleteComment={(commentId) => deleteComment(selectedTicket.id, commentId)}
            />
          )}
          {!selectedTicket && userView === 'create' && (
            <CreateFeedbackView
              onSubmit={(input) => {
                addTicket(input)
                setUserView('mine')
              }}
            />
          )}
          {!selectedTicket && userView === 'mine' && (
            <MyTicketsView
              tickets={tickets}
              onToggleLike={toggleLike}
              onSystemChange={updateSystem}
              onStatusChange={updateStatus}
              onOpenTicket={openTicket}
            />
          )}
          {!selectedTicket && userView === 'popular' && <PopularTicketsView />}
        </main>
      </div>
    )
  }

  return (
    <div className="fb-app">
      {themeToggle}
      <ModeSwitch mode={mode} onToggle={toggleMode} />
      <Sidebar active={view} onNavigate={setView} collapsed={collapsed} onToggleCollapsed={toggleCollapsed} />

      <main className="fb-main">
        {selectedTicket?.category === 'idea' && (
          <SuggestionDetailView
            ticket={selectedTicket}
            onBack={() => setSelectedTicketId(null)}
            onToggleLike={() => toggleLike(selectedTicket.id)}
            onStatusChange={(status) => updateStatus(selectedTicket.id, status)}
            onAddComment={(text, replyToId, attachments) => addComment(selectedTicket.id, text, replyToId, attachments)}
            onEditComment={(commentId, text) => editComment(selectedTicket.id, commentId, text)}
            onDeleteComment={(commentId) => deleteComment(selectedTicket.id, commentId)}
          />
        )}
        {!selectedTicket && view === 'all' && (
          <AllTicketsView
            tickets={tickets}
            onToggleLike={toggleLike}
            onSystemChange={updateSystem}
            onStatusChange={updateStatus}
            onOpenTicket={openTicket}
          />
        )}
        {!selectedTicket && (view === 'bug' || view === 'idea' || view === 'review') && (
          <CategoryTicketsView
            category={view}
            tickets={tickets}
            onToggleLike={toggleLike}
            onSystemChange={updateSystem}
            onStatusChange={updateStatus}
            onOpenTicket={openTicket}
          />
        )}
        {!selectedTicket && view === 'systems' && <SystemsView />}
        {!selectedTicket && view === 'agents' && <AgentsView />}
      </main>
    </div>
  )
}
