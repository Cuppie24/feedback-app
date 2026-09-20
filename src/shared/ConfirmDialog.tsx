import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import './ConfirmDialog.css'

type ConfirmDialogProps = {
  open: boolean
  title: string
  description?: string
  confirmLabel: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

// Generic destructive-action confirmation, replacing window.confirm so the
// dialog matches the app's own design (tokens, Russian copy, focus styling)
// instead of the browser's native chrome.
export function ConfirmDialog({ open, title, description, confirmLabel, cancelLabel = 'Отмена', onConfirm, onCancel }: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    if (!open) return
    cancelRef.current?.focus()
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onCancel])

  if (!open) return null

  return createPortal(
    <div
      className="fb-confirm-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel()
      }}
    >
      <div
        className="fb-confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
      >
        <h2 id={titleId}>{title}</h2>
        {description && <p id={descriptionId}>{description}</p>}
        <div className="fb-confirm-actions">
          <button type="button" ref={cancelRef} className="fb-confirm-cancel" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className="fb-confirm-confirm" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
