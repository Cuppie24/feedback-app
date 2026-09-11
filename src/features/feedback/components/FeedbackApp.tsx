import { useState } from 'react'
import { useFeedbackTickets, useSidebarCollapsed } from '../hooks'
import { AllTicketsView } from './AllTicketsView'
import { CreateFeedbackWidget } from './CreateFeedbackWidget'
import { MyTicketsView } from './MyTicketsView'
import { Sidebar, type SidebarView } from './Sidebar'
import { TicketDetailView } from './TicketDetailView'
import './FeedbackApp.css'

type View = SidebarView | 'detail'

// No router yet (see CLAUDE.md) - navigation between the feedback screens
// is local view state, same pattern App.tsx already uses for
// loading/login/signed-in. Creating feedback isn't one of these screens
// anymore - it lives in the always-mounted CreateFeedbackWidget floating
// button/panel, collapsed whenever the user navigates via the sidebar.
export function FeedbackApp() {
  const { tickets, toggleLike, addTicket } = useFeedbackTickets()
  const { collapsed, toggleCollapsed } = useSidebarCollapsed()
  const [view, setView] = useState<View>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const openTicket = (id: string) => {
    setCreateOpen(false)
    setSelectedId(id)
    setView('detail')
  }

  const navigate = (next: SidebarView) => {
    setCreateOpen(false)
    setView(next)
  }

  return (
    <div className="fb-app">
      <Sidebar
        active={view === 'detail' ? 'all' : view}
        onNavigate={navigate}
        collapsed={collapsed}
        onToggleCollapsed={toggleCollapsed}
      />

      <main className="fb-main">
        {view === 'mine' && (
          <MyTicketsView tickets={tickets} onOpenTicket={openTicket} onToggleLike={toggleLike} />
        )}
        {view === 'all' && (
          <AllTicketsView tickets={tickets} onOpenTicket={openTicket} onToggleLike={toggleLike} />
        )}
        {view === 'detail' && (
          <TicketDetailView
            ticket={tickets.find((ticket) => ticket.id === selectedId)}
            onBack={() => setView('all')}
          />
        )}

        <CreateFeedbackWidget
          open={createOpen}
          onOpen={() => setCreateOpen(true)}
          onClose={() => setCreateOpen(false)}
          tickets={tickets}
          onSubmit={(input) => openTicket(addTicket(input))}
          onOpenTicket={openTicket}
          onToggleLike={toggleLike}
        />
      </main>
    </div>
  )
}
