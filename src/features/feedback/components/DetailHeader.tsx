import { Copy } from 'lucide-react'
import type { ReactNode } from 'react'
import { STATUS_LABEL, STATUS_TONE } from '../data'
import { useCopyToClipboard } from '../hooks'
import type { Status } from '../types'
import { Tag } from './Tag'
import { TicketCellSelect, type TicketCellOption } from './TicketCellSelect'
import { Toast } from './Toast'
import { VoteButton } from './VoteButton'
import './DetailHeader.css'

type DetailHeaderProps = {
  id: string
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
  children?: ReactNode
}

const STATUS_OPTIONS = (Object.entries(STATUS_LABEL) as [Status, string][]).map(
  ([value, label]): TicketCellOption<Status> => ({ value, label, tone: STATUS_TONE[value] }),
)

// Shared by every ticket detail view - the id/title/status/vote row is
// identical between them. SuggestionDetailView additionally passes its
// proposal block (author/text/attachments) as children, rendered inside the
// same <header> below the top row.
export function DetailHeader({ id, title, status, onStatusChange, statusEditable = true, vote, children }: DetailHeaderProps) {
  const { copiedValue, leaving, copy } = useCopyToClipboard()

  return (
    <>
      <header className="fb-detail-header">
        <div className="fb-detail-header-top">
          <div className="fb-detail-header-main">
            <button
              type="button"
              className="fb-detail-id"
              onClick={() => void copy(id)}
              aria-label={copiedValue === id ? `Номер обращения ${id} скопирован` : `Скопировать номер обращения ${id}`}
            >
              {id}
            </button>
            <h1>{title}</h1>
          </div>
          <div className="fb-detail-actions">
            {statusEditable ? (
              <TicketCellSelect label="Статус" value={status} options={STATUS_OPTIONS} onChange={onStatusChange} />
            ) : (
              status && <Tag tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Tag>
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
