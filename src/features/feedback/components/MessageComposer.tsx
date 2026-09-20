import { CornerUpLeft, FileText, Paperclip, Send, X } from 'lucide-react'
import { useEffect } from 'react'
import type { ClipboardEvent, FormEvent, KeyboardEvent as ReactKeyboardEvent, RefObject } from 'react'
import type { Attachment } from '../types'
import './MessageComposer.css'

type MessageComposerProps = {
  textareaRef: RefObject<HTMLTextAreaElement | null>
  value: string
  onChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  placeholder: string
  ariaLabel: string
  submitAriaLabel: string
  avatarInitials: string
  attachments: Attachment[]
  onAddFiles: (files: FileList | File[]) => void
  onRemoveAttachment: (id: string) => void
  replyLabel?: string
  onScrollToReply?: () => void
  onCancelReply?: () => void
}

// Shared input used by both the ticket chat (TicketChat) and the comment
// section (CommentSection/CommentThread) - same composer look and behavior
// (avatar, autosizing textarea, paste-to-attach, reply reference bar,
// pending attachments) driven by plain props, since the two callers keep
// different state shapes (flat message list vs. threaded comment tree).
export function MessageComposer({
  textareaRef,
  value,
  onChange,
  onSubmit,
  placeholder,
  ariaLabel,
  submitAriaLabel,
  avatarInitials,
  attachments,
  onAddFiles,
  onRemoveAttachment,
  replyLabel,
  onScrollToReply,
  onCancelReply,
}: MessageComposerProps) {
  useEffect(() => {
    const input = textareaRef.current
    if (!input) return
    input.style.height = 'auto'
    const contentHeight = input.scrollHeight
    input.style.height = `${Math.min(contentHeight, 160)}px`
    // scrollHeight can exceed the height we just set by a stray sub-pixel
    // even when the text visibly fits on one line, which left a barely-there
    // scrollbar showing for every message once scrollbars got styled with a
    // visible thumb. Only actually scrollable once content passes the cap.
    input.style.overflowY = contentHeight > 160 ? 'auto' : 'hidden'
  }, [value, textareaRef])

  function submitOnEnter(event: ReactKeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== 'Enter' || event.shiftKey || event.ctrlKey) return
    event.preventDefault()
    event.currentTarget.form?.requestSubmit()
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
      onAddFiles(images)
    }
  }

  return (
    <form className="fb-composer" noValidate onSubmit={onSubmit}>
      {replyLabel && (
        <div className="fb-composer-replying">
          <button
            type="button"
            className="fb-composer-reply-reference"
            onClick={onScrollToReply}
            aria-label={`Перейти к сообщению: ${replyLabel}`}
          >
            <CornerUpLeft size={14} aria-hidden="true" />
            <span>Ответ на {replyLabel}</span>
          </button>
          <button type="button" className="fb-composer-cancel-reply" aria-label="Отменить ответ" title="Отменить ответ" onClick={onCancelReply}>
            <X size={15} />
          </button>
        </div>
      )}
      <div className="fb-composer-field">
        <span className="fb-composer-avatar">{avatarInitials}</span>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={submitOnEnter}
          onPaste={pasteImages}
          placeholder={placeholder}
          aria-label={ariaLabel}
          rows={1}
        />
        <label className="fb-composer-attach-button" aria-label="Прикрепить файлы" title="Прикрепить файлы">
          <Paperclip size={15} />
          <input
            type="file"
            multiple
            onChange={(event) => {
              if (event.target.files?.length) onAddFiles(event.target.files)
              event.target.value = ''
            }}
          />
        </label>
        <button type="submit" className="fb-composer-submit-button" aria-label={submitAriaLabel}>
          <Send size={16} />
        </button>
      </div>
      {attachments.length > 0 && (
        <div className="fb-composer-pending-attachments" aria-label="Прикрепленные файлы">
          {attachments.map((attachment) => (
            <span key={attachment.id} className={`fb-composer-pending-attachment${attachment.kind === 'image' ? ' image' : ''}`}>
              {attachment.kind === 'image' ? (
                <img src={attachment.url} alt={attachment.name} />
              ) : (
                <span className="fb-composer-pending-file-copy">
                  <FileText size={22} />
                  <span>{attachment.name}</span>
                </span>
              )}
              <button type="button" aria-label={`Удалить ${attachment.name}`} onClick={() => onRemoveAttachment(attachment.id)}>
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </form>
  )
}
