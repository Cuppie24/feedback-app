import { ChevronRight, Heart, MessageCircle } from 'lucide-react'
import { CATEGORY_VOTABLE, STATUS_LABEL, STATUS_TONE, SYSTEM_LABEL, hasUnreadMessages } from '../data'
import type { Ticket } from '../types'
import { Tag } from './Tag'
import { VoteButton } from './VoteButton'
import './UserTicketList.css'

type UserTicketListProps = {
  tickets: Ticket[]
  emptyMessage?: string
  onToggleLike?: (id: string) => void
  onOpenTicket: (ticket: Ticket) => void
}

// Read-only cards for employee-facing screens. Agent views deliberately keep
// using TicketList, whose inline status, system, and assignee controls are
// triage actions rather than user-facing information.
export function UserTicketList({
  tickets,
  emptyMessage = 'Ничего не найдено.',
  onToggleLike,
  onOpenTicket,
}: UserTicketListProps) {
  if (tickets.length === 0) {
    return <p className="fb-user-ticket-list-empty">{emptyMessage}</p>
  }

  return (
    <div className="fb-user-ticket-list">
      {tickets.map((ticket) => {
        const snippet = ticket.messages.at(-1)?.text ?? ticket.title
        const unreadMessages = hasUnreadMessages(ticket) ? 1 : 0

        return (
          <article
            key={ticket.id}
            className={`fb-user-ticket-card${unreadMessages > 0 ? ' has-unread' : ''}`}
            role="button"
            tabIndex={0}
            onClick={() => onOpenTicket(ticket)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onOpenTicket(ticket)
              }
            }}
          >
            <div className="fb-user-ticket-title-row">
              <h2 className="fb-user-ticket-title">{ticket.title}</h2>
              <span className="fb-user-ticket-time" title={new Date(ticket.createdAt).toLocaleString('ru-RU')}>
                {ticket.time}
              </span>
            </div>

            <p className="fb-user-ticket-snippet">{snippet}</p>

            <footer className="fb-user-ticket-footer">
              <div className="fb-user-ticket-tags">
                {ticket.status && <Tag tone={STATUS_TONE[ticket.status]}>{STATUS_LABEL[ticket.status]}</Tag>}
                {ticket.system && (
                  <span className="fb-user-ticket-system">
                    <span>Система</span>
                    <Tag tone="neutral">{SYSTEM_LABEL[ticket.system]}</Tag>
                  </span>
                )}
              </div>

              <div className="fb-user-ticket-actions">
                {unreadMessages > 0 && (
                  <span className="fb-user-ticket-unread" aria-label={`${unreadMessages} непрочитанное сообщение`}>
                    <MessageCircle size={14} aria-hidden="true" />
                    {unreadMessages}
                  </span>
                )}
                {CATEGORY_VOTABLE[ticket.category] &&
                  (onToggleLike ? (
                    <VoteButton likes={ticket.likes} liked={ticket.liked} onToggle={() => onToggleLike(ticket.id)} />
                  ) : (
                    <span className="fb-user-ticket-vote-count" aria-label={`${ticket.likes} голосов`}>
                      <Heart size={14} aria-hidden="true" />
                      {ticket.likes}
                    </span>
                  ))}
                <ChevronRight className="fb-user-ticket-open-icon" size={18} aria-hidden="true" />
              </div>
            </footer>
          </article>
        )
      })}
    </div>
  )
}
