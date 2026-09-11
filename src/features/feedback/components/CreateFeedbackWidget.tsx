import { MessageSquarePlus } from 'lucide-react'
import type { NewFeedbackInput, Ticket } from '../types'
import { CreateFeedbackView } from './CreateFeedbackView'
import './CreateFeedbackWidget.css'

type CreateFeedbackWidgetProps = {
  open: boolean
  onOpen: () => void
  tickets: Ticket[]
  onSubmit: (input: NewFeedbackInput) => void
  onOpenTicket: (id: string) => void
  onToggleLike: (id: string) => void
}

// The create-feedback page as a floating widget rather than a sidebar view -
// see CLAUDE.md workflow note. It has no close button: the panel is always
// mounted (never unmounted) so the form keeps its state while collapsed, and
// only collapses back to the round button when the user navigates elsewhere
// via the sidebar (wired in FeedbackApp).
export function CreateFeedbackWidget({
  open,
  onOpen,
  tickets,
  onSubmit,
  onOpenTicket,
  onToggleLike,
}: CreateFeedbackWidgetProps) {
  return (
    <div className="fb-create-widget">
      {!open && (
        <button
          type="button"
          className="fb-create-fab"
          onClick={onOpen}
          aria-label="Новое обращение"
          title="Новое обращение"
        >
          <MessageSquarePlus size={22} />
        </button>
      )}

      <div className={`fb-create-panel${open ? ' open' : ''}`} inert={!open}>
        <div className="fb-create-panel-content">
          <CreateFeedbackView
            tickets={tickets}
            onSubmit={onSubmit}
            onOpenTicket={onOpenTicket}
            onToggleLike={onToggleLike}
          />
        </div>
      </div>
    </div>
  )
}
