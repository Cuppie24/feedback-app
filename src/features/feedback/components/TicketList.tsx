import { ArrowDown, ArrowUp } from 'lucide-react'
import { CATEGORY_ICON, CATEGORY_LABEL, CATEGORY_TONE, CATEGORY_VOTABLE, STATUS_LABEL, STATUS_TONE } from '../data'
import type { Ticket } from '../types'
import type { TicketSort } from './SearchFilterBar'
import { Tag } from './Tag'
import { VoteButton } from './VoteButton'
import './TicketList.css'

export type TicketListVariant = 'compact' | 'wide'

type TicketListProps = {
  tickets: Ticket[]
  variant?: TicketListVariant
  showAuthor?: boolean
  emptyMessage?: string
  onOpen: (id: string) => void
  onToggleLike: (id: string) => void
  sort?: TicketSort
  onSortChange?: (sort: TicketSort) => void
}

export function TicketList({
  tickets,
  variant = 'compact',
  showAuthor = false,
  emptyMessage = 'Ничего не найдено.',
  onOpen,
  onToggleLike,
  sort,
  onSortChange,
}: TicketListProps) {
  if (tickets.length === 0) {
    return <p className="fb-list-empty">{emptyMessage}</p>
  }

  return (
    <div className="fb-list">
      {variant === 'wide' && (
        <div className={`fb-list-header${showAuthor ? '' : ' fb-cols-no-author'}`}>
          <span aria-hidden="true" />
          <span>Обращение</span>
          {showAuthor && <span className="fb-list-header-author">Автор</span>}
          <span>Статус</span>
          {onSortChange ? (
            <button
              type="button"
              className={`fb-list-header-sort${sort === 'popular' ? ' active' : ''}`}
              onClick={() => onSortChange('popular')}
            >
              Голоса
            </button>
          ) : (
            <span>Голоса</span>
          )}
          {onSortChange ? (
            <button
              type="button"
              className={`fb-list-header-sort${sort === 'newest' || sort === 'oldest' ? ' active' : ''}`}
              onClick={() => onSortChange(sort === 'oldest' ? 'newest' : 'oldest')}
            >
              Обновлено
              {sort === 'newest' && <ArrowDown size={12} />}
              {sort === 'oldest' && <ArrowUp size={12} />}
            </button>
          ) : (
            <span>Обновлено</span>
          )}
        </div>
      )}

      {tickets.map((ticket) => {
        const snippet = ticket.messages.at(-1)?.text ?? ticket.title
        const Icon = CATEGORY_ICON[ticket.category]
        const categoryLabel = CATEGORY_LABEL[ticket.category]
        const categoryTone = CATEGORY_TONE[ticket.category]

        return (
          <div
            key={ticket.id}
            className={`fb-row fb-row-${variant}${showAuthor ? '' : ' fb-cols-no-author'}`}
            role="button"
            tabIndex={0}
            onClick={() => onOpen(ticket.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onOpen(ticket.id)
              }
            }}
          >
            <span className="fb-row-cat" title={categoryLabel} aria-label={categoryLabel}>
              <Icon className={`fb-row-cat-icon fb-row-cat-icon-${categoryTone}`} size={16} />
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

            {CATEGORY_VOTABLE[ticket.category] ? (
              <VoteButton likes={ticket.likes} liked={ticket.liked} onToggle={() => onToggleLike(ticket.id)} />
            ) : (
              <span className="fb-row-vote-empty" aria-hidden="true" />
            )}

            <span className="fb-row-time" title={new Date(ticket.createdAt).toLocaleString('ru-RU')}>
              {ticket.time}
            </span>
          </div>
        )
      })}
    </div>
  )
}
