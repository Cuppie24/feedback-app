import { useState } from 'react'
import { useAppMode, useFeedbackTickets, useSidebarCollapsed } from '../hooks'
import { useTheme } from '../../../shared/useTheme'
import { AgentsView } from './AgentsView'
import { AllTicketsView } from './AllTicketsView'
import { CategoryTicketsView } from './CategoryTicketsView'
import { CreateFeedbackView } from './CreateFeedbackView'
import { ErrorDetailView } from './ErrorDetailView'
import { ModeSwitch } from './ModeSwitch'
import { MyTicketsView } from './MyTicketsView'
import { PopularTicketsView } from './PopularTicketsView'
import { Sidebar, type SidebarView } from './Sidebar'
import { SystemsView } from './SystemsView'
import { SuggestionDetailView } from './SuggestionDetailView'
import { ThemeToggle } from './ThemeToggle'
import { UserTabBar, type UserView } from './UserTabBar'
import './FeedbackApp.css'

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

  const openTicket = (ticket: (typeof tickets)[number]) => {
    if (ticket.category === 'idea' || ticket.category === 'bug') setSelectedTicketId(ticket.id)
  }

  if (mode === 'user') {
    return (
      <div className="fb-user-shell">
        <ThemeToggle preference={preference} onCycle={cycleTheme} />
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
          {selectedTicket?.category === 'bug' && (
            <ErrorDetailView
              ticket={selectedTicket}
              onBack={() => setSelectedTicketId(null)}
              onToggleLike={() => toggleLike(selectedTicket.id)}
              onStatusChange={(status) => updateStatus(selectedTicket.id, status)}
              onSendMessage={(text, attachments, replyToId) => addComment(selectedTicket.id, text, replyToId, attachments)}
              onEditMessage={(messageId, text) => editComment(selectedTicket.id, messageId, text)}
              onDeleteMessage={(messageId) => deleteComment(selectedTicket.id, messageId)}
              floatingComments
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
      <Sidebar
        active={view}
        onNavigate={setView}
        collapsed={collapsed}
        onToggleCollapsed={toggleCollapsed}
        footer={
          <>
            <ModeSwitch mode={mode} onToggle={toggleMode} variant="inline" />
            <ThemeToggle preference={preference} onCycle={cycleTheme} variant="inline" />
          </>
        }
      />

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
        {selectedTicket?.category === 'bug' && (
          <ErrorDetailView
            ticket={selectedTicket}
            onBack={() => setSelectedTicketId(null)}
            onToggleLike={() => toggleLike(selectedTicket.id)}
            onStatusChange={(status) => updateStatus(selectedTicket.id, status)}
            onSendMessage={(text, attachments, replyToId) => addComment(selectedTicket.id, text, replyToId, attachments)}
            onEditMessage={(messageId, text) => editComment(selectedTicket.id, messageId, text)}
            onDeleteMessage={(messageId) => deleteComment(selectedTicket.id, messageId)}
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
