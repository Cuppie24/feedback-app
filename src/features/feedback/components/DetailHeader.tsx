import { Copy } from 'lucide-react'
import type { ReactNode } from 'react'
import { CATEGORY_ICON, getCategoryLabel, STATUS_LABEL, STATUS_TONE } from '../data'
import { useCopyToClipboard } from '../hooks'
import type { Category, Status } from '../types'
import { Tag } from './Tag'
import { TicketCellSelect, type TicketCellOption } from './TicketCellSelect'
import { Toast } from './Toast'
import { VoteButton } from './VoteButton'
import './DetailHeader.css'

type DetailHeaderProps = {
  id: string
  category: Category
  title: string
  status: Status | null
  onStatusChange: (status: Status | null) => void
  // Agent mode triages status from here; user mode can only view it (see
  // FeedbackApp.tsx's TicketDetailRoute usage) - status changes belong to
  // support staff, not the ticket's own author.
  statusEditable?: boolean
  // Omitted for categories that can't be voted on (reviews).
  vote?: {
    likes: number
    liked: boolean
    onToggle: () => void
    // Authors see their own vote count but cannot vote.
    readOnly: boolean
  }
  // Rendered directly above the title (e.g. the suggestion's author row).
  byline?: ReactNode
  children?: ReactNode
}

const STATUS_OPTIONS = (Object.entries(STATUS_LABEL) as [Status, string][]).map(
  ([value, label]): TicketCellOption<Status> => ({ value, label, tone: STATUS_TONE[value] }),
)

// Shared by every ticket detail view - the id/title/status/vote row is
// identical between them. SuggestionDetailView additionally passes its
// proposal block (text/attachments) as children, rendered inside the
// same <header> below the top row.
export function DetailHeader({ id, category, title, status, onStatusChange, statusEditable = true, vote, byline, children }: DetailHeaderProps) {
  const { copiedValue, leaving, copy } = useCopyToClipboard()
  const CategoryIcon = CATEGORY_ICON[category]

  return (
    <>
      <header className="fb-detail-header">
        <div className="fb-detail-header-top">
          <div className="fb-detail-header-main">
            <div className="fb-detail-meta">
              <span className="fb-detail-category">
                <CategoryIcon size={14} strokeWidth={2.5} aria-hidden="true" />
                {getCategoryLabel(category)}
              </span>
              <button
                type="button"
                className="fb-detail-id"
                onClick={() => void copy(id)}
                aria-label={copiedValue === id ? `Номер обращения ${id} скопирован` : `Скопировать номер обращения ${id}`}
              >
                {id}
              </button>
            </div>
            {byline}
            <h1>{title}</h1>
          </div>
          <div className="fb-detail-actions">
            {(statusEditable || status) && (
              <div className="fb-detail-status">
                <span className="fb-detail-status-label">Статус</span>
                {statusEditable ? (
                  <TicketCellSelect label="Статус" value={status} options={STATUS_OPTIONS} onChange={onStatusChange} />
                ) : (
                  status && <Tag tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Tag>
                )}
              </div>
            )}
            {vote && <VoteButton likes={vote.likes} liked={vote.liked} readOnly={vote.readOnly} onToggle={vote.onToggle} />}
          </div>
        </div>
        {children}
      </header>
      <Toast Icon={Copy} open={copiedValue !== null} leaving={leaving}>
        Скопировано
      </Toast>
    </>
  )
}
