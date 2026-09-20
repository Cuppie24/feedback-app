import { ChevronRight, Heart } from 'lucide-react'
import { CATEGORY_ICON, CATEGORY_LABEL, CATEGORY_VOTABLE, STATUS_LABEL, STATUS_TONE, SYSTEM_LABEL, SYSTEM_TONE } from '../data'
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
        const Icon = CATEGORY_ICON[ticket.category]
        const snippet = ticket.messages.at(-1)?.text ?? ticket.title

        return (
          <article
            key={ticket.id}
            className="fb-user-ticket-card"
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
            <div className="fb-user-ticket-card-topline">
              <span className="fb-user-ticket-category">
                <Icon size={15} aria-hidden="true" />
                {CATEGORY_LABEL[ticket.category]}
              </span>
              {ticket.system && (
                <span className="fb-user-ticket-system">
                  <span>Система</span>
                  <Tag tone={SYSTEM_TONE[ticket.system]}>{SYSTEM_LABEL[ticket.system]}</Tag>
                </span>
              )}
              <span className="fb-user-ticket-time" title={new Date(ticket.createdAt).toLocaleString('ru-RU')}>
                {ticket.time}
              </span>
            </div>

            <h2 className="fb-user-ticket-title">{ticket.title}</h2>
            <p className="fb-user-ticket-snippet">{snippet}</p>

            <footer className="fb-user-ticket-footer">
              <div className="fb-user-ticket-tags">
                {ticket.status && <Tag tone={STATUS_TONE[ticket.status]}>{STATUS_LABEL[ticket.status]}</Tag>}
              </div>

              <div className="fb-user-ticket-actions">
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
