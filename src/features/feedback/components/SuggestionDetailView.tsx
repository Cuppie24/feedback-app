import { ArrowLeft, FileText, Image } from 'lucide-react'
import { USERS } from '../data'
import { useCommentThread } from '../hooks'
import type { Attachment, MessageSender, Status, Ticket } from '../types'
import { CommentComposer } from './CommentComposer'
import { CommentSection } from './CommentSection'
import { DetailHeader } from './DetailHeader'
import { UserPopover } from './UserPopover'
import './SuggestionDetailView.css'

type SuggestionDetailViewProps = {
  ticket: Ticket
  onBack: () => void
  onToggleLike: () => void
  onStatusChange: (status: Status | null) => void
  onAddComment: (text: string, replyToId?: string, attachments?: Attachment[]) => string
  onEditComment: (commentId: string, text: string) => void
  onDeleteComment: (commentId: string) => void
}

export function SuggestionDetailView({ ticket, onBack, onToggleLike, onStatusChange, onAddComment, onEditComment, onDeleteComment }: SuggestionDetailViewProps) {
  const proposal = ticket.messages[0]
  const comments = ticket.messages.slice(1)
  const thread = useCommentThread({ comments, onAddComment, onEditComment, onDeleteComment })

  function resolveAuthor(sender: MessageSender) {
    return sender === 'agent' ? ticket.assignee : USERS.me
  }

  return (
    <article className="fb-suggestion-detail">
      <div className="fb-detail-scroll">
        <div className="fb-detail-content">
          <button type="button" className="fb-detail-back" onClick={onBack}>
            <ArrowLeft size={16} />
            Все обращения
          </button>

          <DetailHeader
            id={ticket.id}
            title={ticket.title}
            status={ticket.status}
            onStatusChange={onStatusChange}
            likes={ticket.likes}
            liked={ticket.liked}
            onToggleLike={onToggleLike}
          >
            <div className="fb-detail-proposal" aria-label="Предложение">
              <div className="fb-detail-author">
                <UserPopover user={ticket.author} label="Автор" showName />
                <span className="fb-detail-author-role">{ticket.author.role}</span>
                <time>{proposal.time}</time>
              </div>
              <p className="fb-detail-proposal-text">{proposal.text}</p>
              {proposal.attachments.length > 0 && (
                <div className="fb-detail-attachments" aria-label="Вложения">
                  {proposal.attachments.map((attachment) => (
                    <a key={attachment.id} className="fb-detail-attachment" href={attachment.url} target="_blank" rel="noreferrer">
                      {attachment.kind === 'image' ? <Image size={16} /> : <FileText size={16} />}
                      <span>{attachment.name}</span>
                      {attachment.sizeLabel && <small>{attachment.sizeLabel}</small>}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </DetailHeader>

          <CommentSection thread={thread} resolveAuthor={resolveAuthor} commentCount={comments.length} />
        </div>
      </div>

      <div className="fb-detail-composer-dock">
        <div className="fb-detail-composer-panel">
          <CommentComposer thread={thread} resolveAuthor={resolveAuthor} />
        </div>
      </div>
    </article>
  )
}
