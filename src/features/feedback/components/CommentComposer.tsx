import { CornerUpLeft, FileText, Paperclip, Send, X } from 'lucide-react'
import type { CommentThreadState } from '../hooks'
import type { MessageSender, User } from '../types'
import './CommentComposer.css'

type CommentComposerProps = {
  thread: CommentThreadState
  resolveAuthor: (sender: MessageSender) => User | null
}

export function CommentComposer({ thread, resolveAuthor }: CommentComposerProps) {
  const { commentInputRef } = thread
  const replyTarget = thread.replyTarget
  const replyTargetName = replyTarget ? resolveAuthor(replyTarget.sender)?.name ?? 'Команда продукта' : undefined

  return (
    <form
      className="fb-detail-comment-composer"
      noValidate
      onSubmit={thread.submitComment}
    >
      {replyTarget && (
        <div className="fb-detail-composer-replying">
          <button
            type="button"
            className="fb-detail-composer-reply-reference"
            onClick={() => thread.scrollToComment(replyTarget.id)}
            aria-label={`Перейти к комментарию ${replyTargetName}`}
          >
            <CornerUpLeft size={14} aria-hidden="true" />
            <span>Ответ на {replyTargetName}</span>
          </button>
          <button
            type="button"
            className="fb-detail-cancel-reply"
            aria-label="Отменить ответ"
            title="Отменить ответ"
            onClick={thread.cancelReply}
          >
            <X size={15} />
          </button>
        </div>
      )}
      <div className="fb-detail-composer-field">
        <span className="fb-detail-composer-avatar">{resolveAuthor('me')?.initials ?? ''}</span>
        <textarea
          ref={commentInputRef}
          value={thread.commentText}
          onChange={(event) => thread.updateCommentText(event.target.value)}
          onKeyDown={thread.submitOnEnter}
          onPaste={thread.pasteImages}
          placeholder="Добавить комментарий..."
          aria-label="Текст комментария"
          rows={1}
        />
        <label className="fb-detail-attach-button" aria-label="Прикрепить файлы" title="Прикрепить файлы">
          <Paperclip size={15} />
          <input type="file" multiple onChange={(event) => {
            if (event.target.files?.length) thread.addFiles(event.target.files)
            event.target.value = ''
          }} />
        </label>
        <button type="submit" className="fb-detail-submit-comment" aria-label="Отправить комментарий"><Send size={16} /></button>
      </div>
      {thread.attachments.length > 0 && (
        <div className="fb-detail-pending-attachments" aria-label="Прикрепленные файлы">
          {thread.attachments.map((attachment) => (
            <span key={attachment.id} className={`fb-detail-pending-attachment${attachment.kind === 'image' ? ' image' : ''}`}>
              {attachment.kind === 'image' ? (
                <img src={attachment.url} alt={attachment.name} />
              ) : (
                <span className="fb-detail-pending-file-copy">
                  <FileText size={22} />
                  <span>{attachment.name}</span>
                </span>
              )}
              <button type="button" aria-label={`Удалить ${attachment.name}`} onClick={() => thread.removeAttachment(attachment.id)}>
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
      {thread.commentError && <p className="fb-detail-comment-error" role="alert">{thread.commentError}</p>}
    </form>
  )
}
