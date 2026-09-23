import { Navigate, useNavigate, useParams } from 'react-router-dom'
import type { Attachment, Status, Ticket } from '../types'
import { ErrorDetailView } from './ErrorDetailView'
import { ReviewDetailView } from './ReviewDetailView'
import { SuggestionDetailView } from './SuggestionDetailView'

type TicketDetailRouteProps = {
  tickets: Ticket[]
  fallbackTo: string
  onToggleLike: (id: string) => void
  onStatusChange: (id: string, status: Status | null) => void
  statusEditable?: boolean
  onAddComment: (ticketId: string, text: string, replyToId?: string, attachments?: Attachment[]) => string
  onEditComment: (ticketId: string, commentId: string, text: string) => void
  onDeleteComment: (ticketId: string, commentId: string) => void
  commentsBelowHeader?: boolean
}

// Resolves :ticketId to a ticket and picks the matching detail view - idea
// tickets get SuggestionDetailView, bug tickets get ErrorDetailView, review
// tickets get ReviewDetailView. Unknown ids redirect back instead.
export function TicketDetailRoute({
  tickets,
  fallbackTo,
  onToggleLike,
  onStatusChange,
  statusEditable,
  onAddComment,
  onEditComment,
  onDeleteComment,
  commentsBelowHeader,
}: TicketDetailRouteProps) {
  const { ticketId } = useParams()
  const navigate = useNavigate()
  const ticket = tickets.find((candidate) => candidate.id === ticketId)

  if (!ticket) {
    return <Navigate to={fallbackTo} replace />
  }

  const onBack = () => navigate(-1)

  if (ticket.category === 'review') {
    return (
      <ReviewDetailView
        ticket={ticket}
        onBack={onBack}
        onStatusChange={(status) => onStatusChange(ticket.id, status)}
        statusEditable={statusEditable}
        onSendMessage={(text, attachments, replyToId) => onAddComment(ticket.id, text, replyToId, attachments)}
        onEditMessage={(messageId, text) => onEditComment(ticket.id, messageId, text)}
        onDeleteMessage={(messageId) => onDeleteComment(ticket.id, messageId)}
      />
    )
  }

  if (ticket.category === 'idea') {
    return (
      <SuggestionDetailView
        ticket={ticket}
        onBack={onBack}
        onToggleLike={() => onToggleLike(ticket.id)}
        onStatusChange={(status) => onStatusChange(ticket.id, status)}
        statusEditable={statusEditable}
        onAddComment={(text, replyToId, attachments) => onAddComment(ticket.id, text, replyToId, attachments)}
        onEditComment={(commentId, text) => onEditComment(ticket.id, commentId, text)}
        onDeleteComment={(commentId) => onDeleteComment(ticket.id, commentId)}
      />
    )
  }

  return (
    <ErrorDetailView
      ticket={ticket}
      onBack={onBack}
      onToggleLike={() => onToggleLike(ticket.id)}
      onStatusChange={(status) => onStatusChange(ticket.id, status)}
      statusEditable={statusEditable}
      onSendMessage={(text, attachments, replyToId) => onAddComment(ticket.id, text, replyToId, attachments)}
      onEditMessage={(messageId, text) => onEditComment(ticket.id, messageId, text)}
      onDeleteMessage={(messageId) => onDeleteComment(ticket.id, messageId)}
      commentsBelowHeader={commentsBelowHeader}
    />
  )
}
