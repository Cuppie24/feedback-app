import { ArrowLeft } from 'lucide-react'
import { CATEGORY_LABEL, CATEGORY_TONE, STATUS_LABEL, STATUS_TONE } from '../data'
import type { Ticket } from '../types'
import { Tag } from './Tag'
import './ViewLayout.css'
import './TicketDetailView.css'

type TicketDetailViewProps = {
  ticket: Ticket | undefined
  onBack: () => void
}

export function TicketDetailView({ ticket, onBack }: TicketDetailViewProps) {
  if (!ticket) {
    return (
      <div className="fb-view">
        <button type="button" className="fb-back-link" onClick={onBack}>
          <ArrowLeft size={14} />
          Назад
        </button>
        <p className="fb-page-sub">Обращение не найдено.</p>
      </div>
    )
  }

  return (
    <div className="fb-view">
      <button type="button" className="fb-back-link" onClick={onBack}>
        <ArrowLeft size={14} />
        Назад
      </button>

      <div className="fb-detail-tags">
        <Tag tone={CATEGORY_TONE[ticket.category]}>{CATEGORY_LABEL[ticket.category]}</Tag>
        {ticket.status && <Tag tone={STATUS_TONE[ticket.status]}>{STATUS_LABEL[ticket.status]}</Tag>}
      </div>
      <h1 className="fb-detail-title">Обращение {ticket.id}</h1>

      <div className="fb-chat-panel">
        <div className="fb-chat-messages">
          {ticket.messages.map((message) => (
            <div key={message.id} className={`fb-msg-row${message.sender === 'me' ? ' mine' : ''}`}>
              <div className={`fb-msg-bubble${message.sender === 'me' ? ' mine' : ''}`}>
                <div>{message.text}</div>
                <div className="fb-msg-time">{message.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
