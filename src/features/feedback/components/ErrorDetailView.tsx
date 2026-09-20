import { ArrowLeft, MessageCircle, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { STATUS_LABEL, STATUS_TONE, USERS } from '../data'
import { useCommentThread, useTicketChat } from '../hooks'
import type { Attachment, Message, MessageSender, Status, Ticket } from '../types'
import { CommentComposer } from './CommentComposer'
import { CommentSection } from './CommentSection'
import { MessageComposer } from './MessageComposer'
import { TicketCellSelect, type TicketCellOption } from './TicketCellSelect'
import { TicketChatLog } from './TicketChatLog'
import { VoteButton } from './VoteButton'
import './ErrorDetailView.css'

type ErrorDetailViewProps = {
  ticket: Ticket
  onBack: () => void
  onToggleLike: () => void
  onStatusChange: (status: Status | null) => void
  onSendMessage: (text: string, attachments: Attachment[], replyToId?: string) => void
  onEditMessage: (messageId: string, text: string) => void
  onDeleteMessage: (messageId: string) => void
  // User mode wants the discussion as a corner-docked floating card shown
  // alongside the main panel (no backdrop, not modal); agent mode keeps
  // the right-side sliding panel.
  floatingComments?: boolean
}

const STATUS_OPTIONS = (Object.entries(STATUS_LABEL) as [Status, string][]).map(
  ([value, label]): TicketCellOption<Status> => ({ value, label, tone: STATUS_TONE[value] }),
)

export function ErrorDetailView({ ticket, onBack, onToggleLike, onStatusChange, onSendMessage, onEditMessage, onDeleteMessage, floatingComments = false }: ErrorDetailViewProps) {
  // Comments are kept separate from the chat log (ticket.messages) - this
  // panel is for open discussion, the chat above it is the 1:1 thread with
  // the assignee. Local state for now: there's no seed/backend shape yet
  // for who besides the author can post here, so nothing is persisted to
  // the shared ticket data until that's decided.
  const [comments, setComments] = useState<Message[]>([])
  const [commentsOpen, setCommentsOpen] = useState(false)
  const composerDockRef = useRef<HTMLDivElement>(null)
  // Starting value matches the dock's collapsed height (padding + a
  // single-line composer, see ErrorDetailView.css) so there's no jump on
  // first paint before the observer's first measurement lands.
  const [composerDockHeight, setComposerDockHeight] = useState(80)

  useEffect(() => {
    if (!commentsOpen) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setCommentsOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [commentsOpen])

  // The composer dock grows when a reply bar or pending attachments show up
  // (or the textarea wraps to more lines), and the "Открыть обсуждение" FAB
  // is portaled to document.body as position:fixed - it can't just follow
  // the dock via normal layout, so its offset is measured and kept in sync
  // here instead.
  useEffect(() => {
    const dock = composerDockRef.current
    if (!dock) return
    const observer = new ResizeObserver(() => setComposerDockHeight(dock.offsetHeight))
    observer.observe(dock)
    return () => observer.disconnect()
  }, [])

  function resolveCommentAuthor(sender: MessageSender) {
    return sender === 'agent' ? ticket.assignee : USERS.me
  }

  function addComment(text: string, replyToId?: string, attachments: Attachment[] = []): string {
    const id = crypto.randomUUID()
    setComments((prev) => [
      ...prev,
      { id, sender: 'me', text, time: 'только что', attachments, ...(replyToId ? { replyToId } : {}) },
    ])
    return id
  }

  function editComment(commentId: string, text: string) {
    setComments((prev) => prev.map((comment) => (comment.id === commentId ? { ...comment, text, time: 'изменено только что' } : comment)))
  }

  function deleteComment(commentId: string) {
    setComments((prev) => {
      const deleted = prev.find((comment) => comment.id === commentId)
      if (!deleted) return prev
      return prev
        .filter((comment) => comment.id !== commentId)
        .map((comment) => (comment.replyToId === commentId ? { ...comment, replyToId: deleted.replyToId } : comment))
    })
  }

  const thread = useCommentThread({ comments, onAddComment: addComment, onEditComment: editComment, onDeleteComment: deleteComment })
  const chat = useTicketChat({ ticket, onSendMessage, onEditMessage, onDeleteMessage })
  const replyTo = chat.replyTo

  return (
    <article className={`fb-error-detail${commentsOpen && !floatingComments ? ' comments-open' : ''}`}>
      <div className="fb-detail-scroll">
        <div className="fb-detail-content">
          <button type="button" className="fb-detail-back" onClick={onBack}>
            <ArrowLeft size={16} />
            Все обращения
          </button>

          <header className="fb-detail-header">
            <div className="fb-detail-header-top">
              <div className="fb-detail-header-main">
                <span className="fb-detail-id">{ticket.id}</span>
                <h1>{ticket.title}</h1>
              </div>
              <div className="fb-detail-actions">
                <VoteButton likes={ticket.likes} liked={ticket.liked} onToggle={onToggleLike} />
                <TicketCellSelect label="Статус" value={ticket.status} options={STATUS_OPTIONS} onChange={onStatusChange} />
              </div>
            </div>
          </header>

          <TicketChatLog ticket={ticket} chat={chat} />
        </div>
      </div>

      <div className="fb-detail-composer-dock" ref={composerDockRef}>
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

      {/* Portaled to body: a position:fixed descendant still counts toward
          its scrolling ancestor's scrollWidth here (the panel's transform
          moves it off-screen visually, but transforms don't affect the
          layout-time box that scrollWidth is computed from), which showed
          up as a phantom horizontal scrollbar on .fb-main/.fb-user-content.
          Rendering outside that subtree entirely sidesteps it. */}
      {createPortal(
        <>
          {!commentsOpen && (
            <button
              type="button"
              className="fb-error-comments-fab"
              style={{ bottom: `calc(${composerDockHeight}px + var(--space-16))` }}
              onClick={() => setCommentsOpen(true)}
            >
              <MessageCircle size={16} />
              Открыть обсуждение
              {comments.length > 0 && <span className="fb-error-comments-fab-count">{comments.length}</span>}
            </button>
          )}

          <aside
            className={`fb-error-comments-panel${floatingComments ? ' floating' : ''}${commentsOpen ? ' open' : ''}`}
            aria-label="Обсуждение"
            aria-hidden={!commentsOpen}
          >
            <div className="fb-error-comments-panel-bar">
              <button type="button" className="fb-error-comments-panel-close" onClick={() => setCommentsOpen(false)} aria-label="Закрыть обсуждение">
                <X size={18} />
              </button>
            </div>
            <div className="fb-error-comments-panel-body">
              <CommentSection thread={thread} resolveAuthor={resolveCommentAuthor} commentCount={comments.length} />
            </div>
            <div className="fb-error-comments-panel-composer">
              <CommentComposer thread={thread} resolveAuthor={resolveCommentAuthor} />
            </div>
          </aside>
        </>,
        document.body,
      )}
    </article>
  )
}
