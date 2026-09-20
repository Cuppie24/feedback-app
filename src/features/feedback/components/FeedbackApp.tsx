import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { readStoredMode, useFeedbackTickets } from '../hooks'
import type { Ticket } from '../types'
import { AgentShell } from './AgentShell'
import { AgentsView } from './AgentsView'
import { AllTicketsView } from './AllTicketsView'
import { CategoryTicketsView } from './CategoryTicketsView'
import { CreateFeedbackView } from './CreateFeedbackView'
import { MyTicketsView } from './MyTicketsView'
import { PopularTicketsView } from './PopularTicketsView'
import { SystemsView } from './SystemsView'
import { TicketDetailRoute } from './TicketDetailRoute'
import { UserShell } from './UserShell'
import './FeedbackApp.css'

// Every feedback screen is now a real route (see CLAUDE.md - this replaced
// the old local view-state switch). The two modes stay separate render
// trees (AgentShell vs UserShell), each with its own nested routes; a
// ticket's detail page lives under whichever list it was opened from, so
// the shell's active nav item stays correct without extra bookkeeping.
//
// Route map:
//   /                        -> redirect to last-used mode (see readStoredMode)
//   /agent                   -> redirect to /agent/all
//   /agent/all               -> AllTicketsView
//   /agent/all/:ticketId     -> ticket detail
//   /agent/bug               -> CategoryTicketsView (bug)
//   /agent/bug/:ticketId     -> ticket detail
//   /agent/idea              -> CategoryTicketsView (idea)
//   /agent/idea/:ticketId    -> ticket detail
//   /agent/review            -> CategoryTicketsView (review, no detail page)
//   /agent/systems           -> SystemsView (placeholder)
//   /agent/agents            -> AgentsView (placeholder)
//   /user                    -> redirect to /user/create
//   /user/create             -> CreateFeedbackView
//   /user/mine               -> MyTicketsView
//   /user/mine/:ticketId     -> ticket detail (floating comments panel)
//   /user/popular            -> PopularTicketsView (placeholder)
// Idea and bug tickets have a detail page; review tickets don't (see
// TicketDetailRoute and the /agent/review route below, which has no
// :ticketId child) - so opening one from a mixed list (all/mine) is a
// no-op, same as the old openTicket's category guard.
function hasDetailPage(ticket: Ticket) {
  return ticket.category === 'idea' || ticket.category === 'bug'
}

export function FeedbackApp() {
  const { tickets, toggleLike, updateSystem, updateStatus, addComment, editComment, deleteComment, addTicket } = useFeedbackTickets()
  const navigate = useNavigate()

  return (
    <Routes>
      <Route index element={<Navigate to={`/${readStoredMode()}`} replace />} />

      <Route path="agent" element={<AgentShell />}>
        <Route index element={<Navigate to="all" replace />} />

        <Route
          path="all"
          element={
            <AllTicketsView
              tickets={tickets}
              onToggleLike={toggleLike}
              onSystemChange={updateSystem}
              onStatusChange={updateStatus}
              onOpenTicket={(ticket) => hasDetailPage(ticket) && navigate(`/agent/all/${ticket.id}`)}
            />
          }
        />
        <Route
          path="all/:ticketId"
          element={
            <TicketDetailRoute
              tickets={tickets}
              fallbackTo="/agent/all"
              onToggleLike={toggleLike}
              onStatusChange={updateStatus}
              onAddComment={addComment}
              onEditComment={editComment}
              onDeleteComment={deleteComment}
            />
          }
        />

        {(['bug', 'idea', 'review'] as const).map((category) => (
          <Route key={category} path={category}>
            <Route
              index
              element={
                <CategoryTicketsView
                  category={category}
                  tickets={tickets}
                  onToggleLike={toggleLike}
                  onSystemChange={updateSystem}
                  onStatusChange={updateStatus}
                  onOpenTicket={(ticket) => hasDetailPage(ticket) && navigate(`/agent/${category}/${ticket.id}`)}
                />
              }
            />
            {category !== 'review' && (
              <Route
                path=":ticketId"
                element={
                  <TicketDetailRoute
                    tickets={tickets}
                    fallbackTo={`/agent/${category}`}
                    onToggleLike={toggleLike}
                    onStatusChange={updateStatus}
                    onAddComment={addComment}
                    onEditComment={editComment}
                    onDeleteComment={deleteComment}
                  />
                }
              />
            )}
          </Route>
        ))}

        <Route path="systems" element={<SystemsView />} />
        <Route path="agents" element={<AgentsView />} />
      </Route>

      <Route path="user" element={<UserShell />}>
        <Route index element={<Navigate to="create" replace />} />

        <Route
          path="create"
          element={
            <CreateFeedbackView
              onSubmit={(input) => {
                addTicket(input)
                navigate('/user/mine')
              }}
            />
          }
        />
        <Route
          path="mine"
          element={
            <MyTicketsView
              tickets={tickets}
              onToggleLike={toggleLike}
              onSystemChange={updateSystem}
              onStatusChange={updateStatus}
              onOpenTicket={(ticket) => hasDetailPage(ticket) && navigate(`/user/mine/${ticket.id}`)}
            />
          }
        />
        <Route
          path="mine/:ticketId"
          element={
            <TicketDetailRoute
              tickets={tickets}
              fallbackTo="/user/mine"
              onToggleLike={toggleLike}
              onStatusChange={updateStatus}
              onAddComment={addComment}
              onEditComment={editComment}
              onDeleteComment={deleteComment}
              floatingComments
            />
          }
        />
        <Route path="popular" element={<PopularTicketsView />} />
      </Route>

      <Route path="*" element={<Navigate to={`/${readStoredMode()}`} replace />} />
    </Routes>
  )
}
