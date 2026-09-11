import { CATEGORY_LABEL, CATEGORY_TONE, STATUS_LABEL, STATUS_TONE } from '../data'
import type { Ticket } from '../types'
import { Tag } from './Tag'
import { VoteButton } from './VoteButton'
import './TicketList.css'

export type TicketListVariant = 'compact' | 'comfortable' | 'wide'

type TicketListProps = {
  tickets: Ticket[]
  variant?: TicketListVariant
  showAuthor?: boolean
  emptyMessage?: string
  onOpen: (id: string) => void
  onToggleLike: (id: string) => void
}

export function TicketList({
  tickets,
  variant = 'compact',
  showAuthor = false,
  emptyMessage = 'Ничего не найдено.',
  onOpen,
  onToggleLike,
}: TicketListProps) {
  if (tickets.length === 0) {
    return <p className="fb-list-empty">{emptyMessage}</p>
  }

  return (
    <div className="fb-list">
      {tickets.map((ticket) => {
        const snippet = ticket.messages.at(-1)?.text ?? ticket.title

        return (
          <div
            key={ticket.id}
            className={`fb-row fb-row-${variant}`}
            role="link"
            tabIndex={0}
            onClick={() => onOpen(ticket.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onOpen(ticket.id)
              }
            }}
          >
            <span className="fb-row-cat">
              <Tag tone={CATEGORY_TONE[ticket.category]}>{CATEGORY_LABEL[ticket.category]}</Tag>
            </span>

            <span className="fb-row-body">
              <span className="fb-row-title">{ticket.title}</span>
              <span className="fb-row-snippet">{snippet}</span>
            </span>

            {showAuthor && (
              <span className="fb-row-author">
                <span className="fb-row-avatar">{ticket.initials}</span>
                <span className="fb-row-author-name">{ticket.author}</span>
              </span>
            )}

            <span className="fb-row-status">
              <Tag tone={STATUS_TONE[ticket.status]}>{STATUS_LABEL[ticket.status]}</Tag>
            </span>

            <VoteButton likes={ticket.likes} liked={ticket.liked} onToggle={() => onToggleLike(ticket.id)} />

            <span className="fb-row-time">{ticket.time}</span>
          </div>
        )
      })}
    </div>
  )
}
