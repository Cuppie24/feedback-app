import { MessageSquarePlus, X } from 'lucide-react'
import type { NewFeedbackInput, Ticket } from '../types'
import { CreateFeedbackView } from './CreateFeedbackView'
import './CreateFeedbackWidget.css'

type CreateFeedbackWidgetProps = {
  open: boolean
  onOpen: () => void
  onClose: () => void
  tickets: Ticket[]
  onSubmit: (input: NewFeedbackInput) => void
  onOpenTicket: (id: string) => void
  onToggleLike: (id: string) => void
}

// The create-feedback page as a floating widget rather than a sidebar view -
// see CLAUDE.md workflow note. The panel is always mounted (never unmounted)
// so the form keeps its state while collapsed - closing it (via its own
// close button, or navigating elsewhere via the sidebar) only hides it.
export function CreateFeedbackWidget({
  open,
  onOpen,
  onClose,
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
          <button type="button" className="fb-create-close" onClick={onClose} aria-label="Закрыть">
            <X size={20} strokeWidth={2.25} />
          </button>

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
