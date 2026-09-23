import { ArrowLeft } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { USERS } from '../data'
import { useTicketChat } from '../hooks'
import type { Attachment, Status, Ticket } from '../types'
import { DetailHeader } from './DetailHeader'
import { MessageComposer } from './MessageComposer'
import { TicketChatLog } from './TicketChatLog'
import './DetailLayout.css'
import './ReviewDetailView.css'

type ReviewDetailViewProps = {
  ticket: Ticket
  onBack: () => void
  onStatusChange: (status: Status | null) => void
  statusEditable?: boolean
  onSendMessage: (text: string, attachments: Attachment[], replyToId?: string) => void
  onEditMessage: (messageId: string, text: string) => void
  onDeleteMessage: (messageId: string) => void
}

// Same header + chat as ErrorDetailView, minus the vote (reviews aren't
// votable) and the discussion panel - a review is just a 1:1 thread.
export function ReviewDetailView({ ticket, onBack, onStatusChange, statusEditable, onSendMessage, onEditMessage, onDeleteMessage }: ReviewDetailViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const chat = useTicketChat({ ticket, onSendMessage, onEditMessage, onDeleteMessage })
  const replyTo = chat.replyTo
  const messageCount = ticket.messages.length

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messageCount])

  return (
    <article className="fb-review-detail">
      <div className="fb-detail-scroll" ref={scrollRef}>
        <div className="fb-detail-back-rail">
          <button type="button" className="fb-detail-back" onClick={onBack}>
            <ArrowLeft size={16} />
            Все обращения
          </button>
        </div>

        <div className="fb-detail-content">
          <DetailHeader
            id={ticket.id}
            category={ticket.category}
            title={ticket.title}
            status={ticket.status}
            onStatusChange={onStatusChange}
            statusEditable={statusEditable}
          />

          <TicketChatLog ticket={ticket} chat={chat} />
        </div>
      </div>

      <div className="fb-detail-composer-dock">
        <div className="fb-detail-composer-panel">
          <MessageComposer
            textareaRef={chat.inputRef}
            value={chat.text}
            onChange={chat.setText}
            onSubmit={chat.submit}
            placeholder="Написать сообщение..."
            ariaLabel="Сообщение"
            submitAriaLabel="Отправить сообщение"
            avatarInitials={USERS.me.initials}
            attachments={chat.attachments}
            onAddFiles={chat.addFiles}
            onRemoveAttachment={chat.removeAttachment}
            replyLabel={replyTo ? chat.replyToName : undefined}
            onScrollToReply={replyTo ? () => chat.scrollToMessage(replyTo.id) : undefined}
            onCancelReply={chat.cancelReply}
          />
        </div>
      </div>
    </article>
  )
}
