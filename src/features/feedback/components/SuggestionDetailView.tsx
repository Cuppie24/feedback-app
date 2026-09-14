import { ArrowLeft, CornerUpLeft, FileText, Image, MessageCircle, Paperclip, Send, X } from 'lucide-react'
import { useEffect, useRef, useState, type ClipboardEvent, type FocusEvent, type FormEvent, type KeyboardEvent } from 'react'
import { STATUS_LABEL, STATUS_TONE, USERS } from '../data'
import { useAttachments } from '../hooks'
import type { Attachment, Message, Status, Ticket } from '../types'
import { TicketCellSelect, type TicketCellOption } from './TicketCellSelect'
import { UserPopover } from './UserPopover'
import { VoteButton } from './VoteButton'
import './SuggestionDetailView.css'

type SuggestionDetailViewProps = {
  ticket: Ticket
  onBack: () => void
  onToggleLike: () => void
  onStatusChange: (status: Status | null) => void
  onAddComment: (text: string, replyToId?: string, attachments?: Attachment[]) => string
}

const STATUS_OPTIONS = (Object.entries(STATUS_LABEL) as [Status, string][]).map(
  ([value, label]): TicketCellOption<Status> => ({ value, label, tone: STATUS_TONE[value] }),
)

export function SuggestionDetailView({ ticket, onBack, onToggleLike, onStatusChange, onAddComment }: SuggestionDetailViewProps) {
  const proposal = ticket.messages[0]
  const comments = ticket.messages.slice(1)
  const [commentText, setCommentText] = useState('')
  const [replyToId, setReplyToId] = useState<string | null>(null)
  const [commentError, setCommentError] = useState('')
  const commentInputRef = useRef<HTMLTextAreaElement>(null)
  const commentRefs = useRef(new Map<string, HTMLElement>())
  const isSwitchingReplyRef = useRef(false)
  const isNavigatingReplyRef = useRef(false)
  const highlightTimerRef = useRef<number | null>(null)
  const highlightFrameRef = useRef<number | null>(null)
  const submittedScrollFrameRef = useRef<number | null>(null)
  const [highlightedCommentId, setHighlightedCommentId] = useState<string | null>(null)
  const { attachments, addFiles, removeAttachment, clearAttachments } = useAttachments()

  useEffect(() => {
    const input = commentInputRef.current
    if (!input) return
    input.style.height = 'auto'
    input.style.height = `${Math.min(input.scrollHeight, 160)}px`
  }, [commentText])

  useEffect(() => {
    if (replyToId) commentInputRef.current?.focus()
  }, [replyToId])

  useEffect(() => () => {
    if (highlightTimerRef.current !== null) window.clearTimeout(highlightTimerRef.current)
    if (highlightFrameRef.current !== null) window.cancelAnimationFrame(highlightFrameRef.current)
    if (submittedScrollFrameRef.current !== null) window.cancelAnimationFrame(submittedScrollFrameRef.current)
  }, [])

  function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = commentText.trim()
    if (!text && attachments.length === 0) {
      setCommentError('Введите текст комментария или прикрепите файл.')
      return
    }
    const commentId = onAddComment(text, replyToId ?? undefined, attachments)
    setCommentText('')
    setReplyToId(null)
    setCommentError('')
    clearAttachments()
    if (submittedScrollFrameRef.current !== null) window.cancelAnimationFrame(submittedScrollFrameRef.current)
    submittedScrollFrameRef.current = window.requestAnimationFrame(() => {
      scrollToComment(commentId)
      submittedScrollFrameRef.current = null
    })
  }

  function pasteImages(event: ClipboardEvent<HTMLTextAreaElement>) {
    const images: File[] = []
    for (const item of event.clipboardData.items) {
      if (item.kind !== 'file' || !item.type.startsWith('image/')) continue
      const file = item.getAsFile()
      if (file) images.push(file)
    }
    if (images.length > 0) {
      event.preventDefault()
      addFiles(images)
    }
  }

  function submitOnEnter(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== 'Enter' || event.shiftKey || event.ctrlKey) return
    event.preventDefault()
    event.currentTarget.form?.requestSubmit()
  }

  function scrollToComment(commentId: string) {
    const target = commentRefs.current.get(commentId)
    if (!target) return
    target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    target.focus({ preventScroll: true })
    if (highlightTimerRef.current !== null) window.clearTimeout(highlightTimerRef.current)
    if (highlightFrameRef.current !== null) window.cancelAnimationFrame(highlightFrameRef.current)
    setHighlightedCommentId(null)
    highlightFrameRef.current = window.requestAnimationFrame(() => {
      setHighlightedCommentId(commentId)
      highlightTimerRef.current = window.setTimeout(() => {
        setHighlightedCommentId(null)
        highlightTimerRef.current = null
      }, 2000)
      highlightFrameRef.current = null
    })
  }

  function renderCommentComposer() {
    const repliedTo = replyToId ? comments.find((comment) => comment.id === replyToId) : undefined
    const repliedToName = repliedTo?.sender === 'agent' ? ticket.assignee?.name ?? 'Команда продукта' : USERS.me.name

    return (
      <form
        className="fb-detail-comment-composer"
        noValidate
        onSubmit={submitComment}
        onBlur={(event: FocusEvent<HTMLFormElement>) => {
          if (
            replyToId &&
            !isSwitchingReplyRef.current &&
            !isNavigatingReplyRef.current &&
            !event.currentTarget.contains(event.relatedTarget) &&
            !commentText.trim() &&
            attachments.length === 0
          ) {
            setReplyToId(null)
          }
        }}
      >
        <div className="fb-detail-composer-field">
          <span className="fb-detail-composer-avatar">ВЫ</span>
          <textarea
            ref={commentInputRef}
            value={commentText}
            onChange={(event) => {
              setCommentText(event.target.value)
              if (commentError) setCommentError('')
            }}
            onKeyDown={submitOnEnter}
            onPaste={pasteImages}
            placeholder="Добавить комментарий..."
            aria-label="Текст комментария"
            rows={1}
          />
          <label className="fb-detail-attach-button" aria-label="Прикрепить файлы" title="Прикрепить файлы">
            <Paperclip size={15} />
            <input type="file" multiple onChange={(event) => {
              if (event.target.files?.length) addFiles(event.target.files)
              event.target.value = ''
            }} />
          </label>
          <button type="submit" className="fb-detail-submit-comment" aria-label="Отправить комментарий"><Send size={16} /></button>
        </div>
        {repliedTo && (
          <div className="fb-detail-composer-replying">
            <button
              type="button"
              className="fb-detail-composer-reply-reference"
              onClick={() => {
                isNavigatingReplyRef.current = true
                scrollToComment(repliedTo.id)
                isNavigatingReplyRef.current = false
              }}
              aria-label={`Перейти к комментарию ${repliedToName}`}
            >
              <CornerUpLeft size={14} aria-hidden="true" />
              <span>Ответ на {repliedToName}</span>
            </button>
            <button
              type="button"
              className="fb-detail-cancel-reply"
              aria-label="Отменить ответ"
              title="Отменить ответ"
              onClick={() => {
                setReplyToId(null)
                commentInputRef.current?.focus()
              }}
            >
              <X size={15} />
            </button>
          </div>
        )}
        {attachments.length > 0 && (
          <div className="fb-detail-pending-attachments" aria-label="Прикрепленные файлы">
            {attachments.map((attachment) => (
              <span key={attachment.id} className={`fb-detail-pending-attachment${attachment.kind === 'image' ? ' image' : ''}`}>
                {attachment.kind === 'image' ? (
                  <img src={attachment.url} alt={attachment.name} />
                ) : (
                  <span className="fb-detail-pending-file-copy">
                    <FileText size={22} />
                    <span>{attachment.name}</span>
                  </span>
                )}
                <button type="button" aria-label={`Удалить ${attachment.name}`} onClick={() => removeAttachment(attachment.id)}>
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
        {commentError && <p className="fb-detail-comment-error" role="alert">{commentError}</p>}
      </form>
    )
  }

  function renderComment(comment: Message) {
    const author = comment.sender === 'agent' ? ticket.assignee : USERS.me
    const isAgent = comment.sender === 'agent'
    const repliedTo = comment.replyToId ? comments.find((item) => item.id === comment.replyToId) : undefined
    const repliedToName = repliedTo?.sender === 'agent' ? ticket.assignee?.name ?? 'Команда продукта' : USERS.me.name

    return (
      <article
        key={comment.id}
        ref={(element) => {
          if (element) commentRefs.current.set(comment.id, element)
          else commentRefs.current.delete(comment.id)
        }}
        className={`fb-detail-comment${isAgent ? ' agent' : ''}${highlightedCommentId === comment.id ? ' is-highlighted' : ''}`}
        tabIndex={-1}
      >
        <div className="fb-detail-comment-body">
          <div className="fb-detail-comment-meta">
            <UserPopover user={author} label={isAgent ? 'Автор ответа' : 'Автор комментария'} showName />
            {isAgent && <span className="fb-detail-agent-label">Агент</span>}
            {repliedTo && (
              <button
                type="button"
                className="fb-detail-reply-to"
                onClick={() => scrollToComment(repliedTo.id)}
                aria-label={`Перейти к комментарию ${repliedToName}`}
              >
                <CornerUpLeft size={14} aria-hidden="true" />
                <span>{repliedToName}</span>
              </button>
            )}
            <time>{comment.time}</time>
          </div>
          <div className="fb-detail-comment-content">
            {comment.text && <p>{comment.text}</p>}
            {comment.attachments.length > 0 && (
              <div className="fb-detail-comment-attachments" aria-label="Вложения комментария">
                {comment.attachments.map((attachment) => (
                  <a key={attachment.id} className="fb-detail-attachment" href={attachment.url} target="_blank" rel="noreferrer">
                    {attachment.kind === 'image' ? <Image size={16} /> : <FileText size={16} />}
                    <span>{attachment.name}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
          {replyToId !== comment.id && (
            <button
              type="button"
              className="fb-detail-reply-button"
              onPointerDown={() => { isSwitchingReplyRef.current = true }}
              onPointerCancel={() => { isSwitchingReplyRef.current = false }}
              onClick={() => {
                isSwitchingReplyRef.current = false
                setReplyToId(comment.id)
              }}
            >
              <CornerUpLeft size={14} aria-hidden="true" />
              Ответить
            </button>
          )}
        </div>
      </article>
    )
  }

  return (
    <article className="fb-suggestion-detail">
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
      </header>

      <div className="fb-detail-composer-dock">
        {renderCommentComposer()}
      </div>

      <section className="fb-detail-comments" aria-labelledby="comments-title">
        <div className="fb-detail-section-heading">
          <MessageCircle size={18} />
          <h2 id="comments-title">Обсуждение</h2>
          <span>{comments.length}</span>
        </div>
        {comments.length > 0 ? (
          <div className="fb-detail-comment-list">
            {comments.map(renderComment)}
          </div>
        ) : (
          <p className="fb-detail-empty">Пока нет комментариев. Начните обсуждение этого предложения.</p>
        )}

      </section>
    </article>
  )
}
