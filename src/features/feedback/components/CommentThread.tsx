import { Check, ChevronRight, CornerUpLeft, FileText, Image, Pencil, Trash2, X } from 'lucide-react'
import type { CommentThreadState } from '../hooks'
import type { MessageSender, User } from '../types'
import type { CommentNode } from '../utils'
import { pluralizeRu } from '../utils'
import { UserPopover } from './UserPopover'
import './CommentThread.css'

// Beyond this nesting level, further replies stop indenting further and
// stack flush with it instead - keeps a long reply-to-a-reply chain from
// eating the whole content column on a narrow viewport.
const MAX_REPLY_INDENT_DEPTH = 3

type CommentThreadProps = {
  comment: CommentNode
  depth: number
  hasNextSibling: boolean
  thread: CommentThreadState
  resolveAuthor: (sender: MessageSender) => User | null
}

export function CommentThread({ comment, depth, hasNextSibling, thread, resolveAuthor }: CommentThreadProps) {
  const author = resolveAuthor(comment.sender)
  const isAgent = comment.sender === 'agent'
  const hasReplies = comment.children.length > 0
  const isCollapsed = thread.collapsedIds.has(comment.id)
  const isOpening = thread.openingIds.has(comment.id)
  const isClosing = thread.closingIds.has(comment.id)
  const isEditing = thread.editingCommentId === comment.id
  const childDepth = Math.min(depth, MAX_REPLY_INDENT_DEPTH)
  // A comment's own rail only leads to its replies. Connections between
  // siblings stay on their shared parent's rail and are drawn by the reply
  // group, so a later sibling never appears to descend from the one above.
  const showConnector = hasReplies && (!isCollapsed || isClosing)

  return (
    <div
      className={`fb-detail-comment-thread${depth === 0 ? ' is-root' : ''}${hasNextSibling ? ' has-next-sibling' : ''}${showConnector ? ' has-expanded-replies' : ''}`}
    >
      <article
        ref={(element) => thread.registerCommentRef(comment.id, element)}
        className={`fb-detail-comment${isAgent ? ' agent' : ''}${thread.highlightedCommentId === comment.id ? ' is-highlighted' : ''}${showConnector ? ' is-linked' : ''}`}
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
              <form className="fb-detail-comment-edit" noValidate onSubmit={(event) => thread.submitEdit(event, comment)}>
                <textarea
                  autoFocus
                  value={thread.editText}
                  onChange={(event) => thread.updateEditText(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') thread.cancelEditing()
                    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) event.currentTarget.form?.requestSubmit()
                  }}
                  aria-label="Текст комментария"
                  rows={3}
                />
                {thread.editError && <p className="fb-detail-comment-edit-error" role="alert">{thread.editError}</p>}
                <div className="fb-detail-comment-edit-actions">
                  <button type="submit" className="fb-detail-comment-edit-save"><Check size={14} />Сохранить</button>
                  <button type="button" className="fb-detail-comment-edit-cancel" onClick={thread.cancelEditing}><X size={14} />Отмена</button>
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
          {!isEditing && (
            <div className="fb-detail-comment-actions">
              {hasReplies && (
                <button
                  type="button"
                  className="fb-detail-toggle-replies"
                  onClick={() => thread.toggleReplies(comment.id)}
                  aria-expanded={!isCollapsed && !isClosing}
                >
                  <ChevronRight size={13} className={`fb-detail-toggle-chevron${isCollapsed || isClosing ? '' : ' is-expanded'}`} aria-hidden="true" />
                  {comment.children.length} {pluralizeRu(comment.children.length, 'ответ', 'ответа', 'ответов')}
                </button>
              )}
              <button
                type="button"
                className="fb-detail-comment-action-button"
                onClick={() => thread.startReply(comment.id)}
              >
                <CornerUpLeft size={14} aria-hidden="true" />
                Ответить
              </button>
              {!isAgent && (
                <>
                  <button type="button" className="fb-detail-comment-action-button" onClick={() => thread.startEditing(comment)}>
                    <Pencil size={14} aria-hidden="true" />
                    Редактировать
                  </button>
                  <button type="button" className="fb-detail-comment-action-button" onClick={() => thread.deleteComment(comment)}>
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
            if (event.target === event.currentTarget) thread.finishRepliesAnimation(comment.id, isClosing)
          }}
        >
          <div className="fb-detail-comment-replies-clip">
            <div className="fb-detail-comment-replies-list">
              {comment.children.map((child, index) => (
                <CommentThread
                  key={child.id}
                  comment={child}
                  depth={depth + 1}
                  hasNextSibling={index < comment.children.length - 1}
                  thread={thread}
                  resolveAuthor={resolveAuthor}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
