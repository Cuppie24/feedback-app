import { ArrowLeft, Check, ChevronRight, CornerUpLeft, FileText, Image, MessageCircle, Paperclip, Pencil, Send, Trash2, X } from 'lucide-react'
import { useEffect, useRef, useState, type ClipboardEvent, type FocusEvent, type FormEvent, type KeyboardEvent } from 'react'
import { STATUS_LABEL, STATUS_TONE, USERS } from '../data'
import { useAttachments } from '../hooks'
import type { Attachment, Status, Ticket } from '../types'
import { buildCommentTree, pluralizeRu, type CommentNode } from '../utils'
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
  onEditComment: (commentId: string, text: string) => void
  onDeleteComment: (commentId: string) => void
}

const STATUS_OPTIONS = (Object.entries(STATUS_LABEL) as [Status, string][]).map(
  ([value, label]): TicketCellOption<Status> => ({ value, label, tone: STATUS_TONE[value] }),
)

// Beyond this nesting level, further replies stop indenting further and
// stack flush with it instead - keeps a long reply-to-a-reply chain from
// eating the whole content column on a narrow viewport.
const MAX_REPLY_INDENT_DEPTH = 3

export function SuggestionDetailView({ ticket, onBack, onToggleLike, onStatusChange, onAddComment, onEditComment, onDeleteComment }: SuggestionDetailViewProps) {
  const proposal = ticket.messages[0]
  const comments = ticket.messages.slice(1)
  const commentTree = buildCommentTree(comments)
  const [commentText, setCommentText] = useState('')
  const [replyToId, setReplyToId] = useState<string | null>(null)
  const [commentError, setCommentError] = useState('')
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [editError, setEditError] = useState('')
  const commentInputRef = useRef<HTMLTextAreaElement>(null)
  const commentRefs = useRef(new Map<string, HTMLElement>())
  const isSwitchingReplyRef = useRef(false)
  const isNavigatingReplyRef = useRef(false)
  const highlightTimerRef = useRef<number | null>(null)
  const highlightFrameRef = useRef<number | null>(null)
  const submittedScrollFrameRef = useRef<number | null>(null)
  const [highlightedCommentId, setHighlightedCommentId] = useState<string | null>(null)
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set())
  const [openingIds, setOpeningIds] = useState<Set<string>>(new Set())
  const [closingIds, setClosingIds] = useState<Set<string>>(new Set())
  const { attachments, addFiles, removeAttachment, clearAttachments } = useAttachments()

  function toggleReplies(commentId: string) {
    if (closingIds.has(commentId)) {
      setClosingIds((prev) => {
        const next = new Set(prev)
        next.delete(commentId)
        return next
      })
      return
    }

    if (collapsedIds.has(commentId)) {
      setCollapsedIds((prev) => {
        const next = new Set(prev)
        next.delete(commentId)
        return next
      })
      setOpeningIds((prev) => new Set(prev).add(commentId))
      return
    }

    setOpeningIds((prev) => {
      if (!prev.has(commentId)) return prev
      const next = new Set(prev)
      next.delete(commentId)
      return next
    })
    setClosingIds((prev) => new Set(prev).add(commentId))
  }

  function finishRepliesAnimation(commentId: string, isClosing: boolean) {
    if (isClosing) {
      setCollapsedIds((prev) => new Set(prev).add(commentId))
      setClosingIds((prev) => {
        const next = new Set(prev)
        next.delete(commentId)
        return next
      })
      return
    }

    setOpeningIds((prev) => {
      const next = new Set(prev)
      next.delete(commentId)
      return next
    })
  }

  function expandReplies(commentId: string) {
    setClosingIds((prev) => {
      if (!prev.has(commentId)) return prev
      const next = new Set(prev)
      next.delete(commentId)
      return next
    })
    setCollapsedIds((prev) => {
      if (!prev.has(commentId)) return prev
      const next = new Set(prev)
      next.delete(commentId)
      return next
    })
  }

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
    if (replyToId) expandReplies(replyToId)
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

  function startEditing(comment: CommentNode) {
    setEditingCommentId(comment.id)
    setEditText(comment.text)
    setEditError('')
  }

  function cancelEditing() {
    setEditingCommentId(null)
    setEditText('')
    setEditError('')
  }

  function submitEdit(event: FormEvent<HTMLFormElement>, comment: CommentNode) {
    event.preventDefault()
    const text = editText.trim()
    if (!text && comment.attachments.length === 0) {
      setEditError('Введите текст комментария.')
      return
    }
    onEditComment(comment.id, text)
    cancelEditing()
  }

  function deleteComment(comment: CommentNode) {
    const confirmed = window.confirm('Удалить комментарий? Ответы на него будут сохранены.')
    if (!confirmed) return
    if (editingCommentId === comment.id) cancelEditing()
    onDeleteComment(comment.id)
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

  function renderComment(comment: CommentNode, depth: number, hasNextSibling: boolean) {
    const author = comment.sender === 'agent' ? ticket.assignee : USERS.me
    const isAgent = comment.sender === 'agent'
    const hasReplies = comment.children.length > 0
    const isCollapsed = collapsedIds.has(comment.id)
    const isOpening = openingIds.has(comment.id)
    const isClosing = closingIds.has(comment.id)
    const isEditing = editingCommentId === comment.id
    const showReplyButton = replyToId !== comment.id
    const childDepth = Math.min(depth, MAX_REPLY_INDENT_DEPTH)
    // A comment's own rail only leads to its replies. Connections between
    // siblings stay on their shared parent's rail and are drawn by the reply
    // group, so a later sibling never appears to descend from the one above.
    const showConnector = hasReplies && (!isCollapsed || isClosing)

    return (
      <div
        key={comment.id}
        className={`fb-detail-comment-thread${depth === 0 ? ' is-root' : ''}${hasNextSibling ? ' has-next-sibling' : ''}${showConnector ? ' has-expanded-replies' : ''}`}
      >
        <article
          ref={(element) => {
            if (element) commentRefs.current.set(comment.id, element)
            else commentRefs.current.delete(comment.id)
          }}
          className={`fb-detail-comment${isAgent ? ' agent' : ''}${highlightedCommentId === comment.id ? ' is-highlighted' : ''}${showConnector ? ' is-linked' : ''}`}
          tabIndex={-1}
        >
          <div className="fb-detail-comment-body">
            <div className="fb-detail-comment-meta">
              <UserPopover user={author} label={isAgent ? 'Автор ответа' : 'Автор комментария'} showName />
              {isAgent && <span className="fb-detail-agent-label">Агент</span>}
              <time>{comment.time}</time>
            </div>
            <div className="fb-detail-comment-content">
              {isEditing ? (
                <form className="fb-detail-comment-edit" noValidate onSubmit={(event) => submitEdit(event, comment)}>
                  <textarea
                    autoFocus
                    value={editText}
                    onChange={(event) => {
                      setEditText(event.target.value)
                      if (editError) setEditError('')
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Escape') cancelEditing()
                      if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) event.currentTarget.form?.requestSubmit()
                    }}
                    aria-label="Текст комментария"
                    rows={3}
                  />
                  {editError && <p className="fb-detail-comment-edit-error" role="alert">{editError}</p>}
                  <div className="fb-detail-comment-edit-actions">
                    <button type="submit" className="fb-detail-comment-edit-save"><Check size={14} />Сохранить</button>
                    <button type="button" className="fb-detail-comment-edit-cancel" onClick={cancelEditing}><X size={14} />Отмена</button>
                  </div>
                </form>
              ) : comment.text ? <p>{comment.text}</p> : null}
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
            {!isEditing && (hasReplies || showReplyButton || !isAgent) && (
              <div className="fb-detail-comment-actions">
                {hasReplies && (
                  <button
                    type="button"
                    className="fb-detail-toggle-replies"
                    onClick={() => toggleReplies(comment.id)}
                    aria-expanded={!isCollapsed && !isClosing}
                  >
                    <ChevronRight size={13} className={`fb-detail-toggle-chevron${isCollapsed || isClosing ? '' : ' is-expanded'}`} aria-hidden="true" />
                    {comment.children.length} {pluralizeRu(comment.children.length, 'ответ', 'ответа', 'ответов')}
                  </button>
                )}
                {showReplyButton && (
                  <button
                    type="button"
                    className="fb-detail-comment-action-button"
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
                {!isAgent && (
                  <>
                    <button type="button" className="fb-detail-comment-action-button" onClick={() => startEditing(comment)}>
                      <Pencil size={14} aria-hidden="true" />
                      Редактировать
                    </button>
                    <button type="button" className="fb-detail-comment-action-button" onClick={() => deleteComment(comment)}>
                      <Trash2 size={14} aria-hidden="true" />
                      Удалить
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </article>
        {hasReplies && (!isCollapsed || isClosing) && (
          <div
            className={`fb-detail-comment-replies depth-${childDepth}${depth === 0 && hasNextSibling ? ' continues-root' : ''}${isOpening ? ' is-opening' : ''}${isClosing ? ' is-closing' : ''}`}
            aria-hidden={isClosing || undefined}
            onAnimationEnd={(event) => {
              if (event.target === event.currentTarget) finishRepliesAnimation(comment.id, isClosing)
            }}
          >
            <div className="fb-detail-comment-replies-clip">
              <div className="fb-detail-comment-replies-list">
                {comment.children.map((child, index) => renderComment(child, depth + 1, index < comment.children.length - 1))}
              </div>
            </div>
          </div>
        )}
      </div>
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
        {commentTree.length > 0 ? (
          <div className="fb-detail-comment-list">
            {commentTree.map((comment, index) => renderComment(comment, 0, index < commentTree.length - 1))}
          </div>
        ) : (
          <p className="fb-detail-empty">Пока нет комментариев. Начните обсуждение этого предложения.</p>
        )}

      </section>
    </article>
  )
}
