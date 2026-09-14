import { useState } from 'react'
import { useAppMode, useFeedbackTickets, useSidebarCollapsed } from '../hooks'
import { AgentsView } from './AgentsView'
import { AllTicketsView } from './AllTicketsView'
import { CategoryTicketsView } from './CategoryTicketsView'
import { CreateFeedbackView } from './CreateFeedbackView'
import { ModeSwitch } from './ModeSwitch'
import { MyTicketsView } from './MyTicketsView'
import { PopularTicketsView } from './PopularTicketsView'
import { Sidebar, type SidebarView } from './Sidebar'
import { SystemsView } from './SystemsView'
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
  const { tickets, toggleLike, updateSystem, updateStatus, addTicket } = useFeedbackTickets()
  const { collapsed, toggleCollapsed } = useSidebarCollapsed()
  const { mode, toggleMode } = useAppMode()
  const [view, setView] = useState<SidebarView>('all')
  const [userView, setUserView] = useState<UserView>('create')

  if (mode === 'user') {
    return (
      <div className="fb-user-shell">
        <ModeSwitch mode={mode} onToggle={toggleMode} />
        <UserTabBar active={userView} onNavigate={setUserView} />

        <main className="fb-user-content">
          {userView === 'create' && (
            <CreateFeedbackView
              onSubmit={(input) => {
                addTicket(input)
                setUserView('mine')
              }}
            />
          )}
          {userView === 'mine' && (
            <MyTicketsView
              tickets={tickets}
              onToggleLike={toggleLike}
              onSystemChange={updateSystem}
              onStatusChange={updateStatus}
            />
          )}
          {userView === 'popular' && <PopularTicketsView />}
        </main>
      </div>
    )
  }

  return (
    <div className="fb-app">
      <ModeSwitch mode={mode} onToggle={toggleMode} />
      <Sidebar active={view} onNavigate={setView} collapsed={collapsed} onToggleCollapsed={toggleCollapsed} />

      <main className="fb-main">
        {view === 'all' && (
          <AllTicketsView
            tickets={tickets}
            onToggleLike={toggleLike}
            onSystemChange={updateSystem}
            onStatusChange={updateStatus}
          />
        )}
        {(view === 'bug' || view === 'idea' || view === 'review') && (
          <CategoryTicketsView
            category={view}
            tickets={tickets}
            onToggleLike={toggleLike}
            onSystemChange={updateSystem}
            onStatusChange={updateStatus}
          />
        )}
        {view === 'systems' && <SystemsView />}
        {view === 'agents' && <AgentsView />}
      </main>
    </div>
  )
}
