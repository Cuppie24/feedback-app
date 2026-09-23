import { ArrowDown, ArrowUp } from 'lucide-react'
import {
  CATEGORY_ICON,
  getCategoryLabel,
  CATEGORY_VOTABLE,
  STATUS_LABEL,
  STATUS_TONE,
  SYSTEM_LABEL,
  SYSTEM_TONE,
} from '../data'
import type { Status, System, Ticket } from '../types'
import { UserPopover } from './UserPopover'
import type { TicketSort } from './SearchFilterBar'
import { TicketCellSelect, type TicketCellOption } from './TicketCellSelect'
import { VoteButton } from './VoteButton'
import './TicketList.css'

export type TicketListVariant = 'compact' | 'wide'

type TicketListProps = {
  tickets: Ticket[]
  variant?: TicketListVariant
  showAuthor?: boolean
  showCategory?: boolean
  emptyMessage?: string
  onToggleLike: (id: string) => void
  onSystemChange: (id: string, system: System | null) => void
  onStatusChange: (id: string, status: Status | null) => void
  onOpenTicket?: (ticket: Ticket) => void
  sort?: TicketSort
  onSortChange?: (sort: TicketSort) => void
}

const SYSTEM_OPTIONS = (Object.entries(SYSTEM_LABEL) as [System, string][]).map(
  ([value, label]): TicketCellOption<System> => ({ value, label, tone: SYSTEM_TONE[value] }),
)

const STATUS_OPTIONS = (Object.entries(STATUS_LABEL) as [Status, string][]).map(
  ([value, label]): TicketCellOption<Status> => ({ value, label, tone: STATUS_TONE[value] }),
)

export function TicketList({
  tickets,
  variant = 'compact',
  showAuthor = false,
  showCategory = true,
  emptyMessage = 'Ничего не найдено.',
  onToggleLike,
  onSystemChange,
  onStatusChange,
  onOpenTicket,
  sort,
  onSortChange,
}: TicketListProps) {
  if (tickets.length === 0) {
    return <p className="fb-list-empty">{emptyMessage}</p>
  }

  return (
    <div className="fb-list">
      {variant === 'wide' && (
        <div
          className={`fb-list-header${showAuthor ? '' : ' fb-cols-no-author'}${showCategory ? '' : ' fb-cols-no-category'}`}
        >
          {showCategory && <span aria-hidden="true" />}
          <span>Статус</span>
          <span>Обращение</span>
          {showAuthor && <span className="fb-list-header-author">Автор</span>}
          <span className="fb-list-header-system">Система</span>
          <span className="fb-list-header-assignee" title="Исполнитель">
            Исп.
          </span>
          {onSortChange ? (
            <button
              type="button"
              className={`fb-list-header-sort fb-list-header-votes${sort === 'popular' ? ' active' : ''}`}
              onClick={() => onSortChange('popular')}
            >
              Голоса
            </button>
          ) : (
            <span className="fb-list-header-votes">Голоса</span>
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
        const categoryLabel = getCategoryLabel(ticket.category)

        return (
          <div
            key={ticket.id}
            className={`fb-row fb-row-${variant}${showAuthor ? '' : ' fb-cols-no-author'}${showCategory ? '' : ' fb-cols-no-category'}`}
            role={onOpenTicket ? 'button' : undefined}
            tabIndex={onOpenTicket ? 0 : undefined}
            onClick={() => onOpenTicket?.(ticket)}
            onKeyDown={(event) => {
              if (onOpenTicket && (event.key === 'Enter' || event.key === ' ')) {
                event.preventDefault()
                onOpenTicket(ticket)
              }
            }}
          >
            {showCategory && (
              <span className="fb-row-cat" title={categoryLabel} aria-label={categoryLabel}>
                <Icon className="fb-row-cat-icon" size={16} />
              </span>
            )}

            <div className="fb-row-status">
              <TicketCellSelect
                label="Статус"
                value={ticket.status}
                options={STATUS_OPTIONS}
                onChange={(status) => onStatusChange(ticket.id, status)}
              />
            </div>

            <span className="fb-row-body">
              <span className="fb-row-title">{ticket.title}</span>
              <span className="fb-row-snippet">{snippet}</span>
            </span>

            {showAuthor && (
              <div className="fb-row-author">
                <UserPopover user={ticket.author} label="Автор" showName />
              </div>
            )}

            <div className="fb-row-system">
              <TicketCellSelect
                label="Система"
                value={ticket.system}
                options={SYSTEM_OPTIONS}
                onChange={(system) => onSystemChange(ticket.id, system)}
              />
            </div>

            <div className="fb-row-assignee">
              <UserPopover user={ticket.assignee} label="Исполнитель" />
            </div>

            {CATEGORY_VOTABLE[ticket.category] ? (
              <VoteButton likes={ticket.likes} liked={ticket.liked} readOnly={ticket.mine} onToggle={() => onToggleLike(ticket.id)} />
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
