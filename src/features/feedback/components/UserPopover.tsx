import { Mail, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { USERS } from '../data'
import { useDismissOnOutsideOrEscape } from '../hooks'
import type { User } from '../types'

type UserPopoverProps = {
  user: User | null
  label: string
  showName?: boolean
}

export function UserPopover({ user, label, showName = false }: UserPopoverProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useDismissOnOutsideOrEscape(open, rootRef, setOpen)

  if (!user) {
    return (
      <span className="fb-row-assignee-empty" title={`${label} не назначен`} aria-label={`${label} не назначен`}>
        —
      </span>
    )
  }

  const isCurrentUser = user.id === USERS.me.id

  return (
    <div
      className={`fb-assignee-popover-root${showName ? ' with-name' : ''}`}
      ref={rootRef}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        event.stopPropagation()
        if (event.key === 'Escape') {
          setOpen(false)
          triggerRef.current?.focus()
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        className={`fb-row-assignee-avatar${showName ? ' with-name' : ''}`}
        aria-label={`${label}: ${user.name}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="fb-row-assignee-initials">{user.initials}</span>
        {showName && <span className="fb-user-popover-name">{user.name}</span>}
        {showName && isCurrentUser && <span className="fb-user-popover-self-label">Вы</span>}
      </button>

      {open && (
        <div className="fb-assignee-popover" role="dialog" aria-label={`Информация: ${label.toLowerCase()}`}>
          <button
            type="button"
            className="fb-assignee-popover-close"
            aria-label="Закрыть"
            onClick={() => setOpen(false)}
          >
            <X size={14} />
          </button>
          <div className="fb-assignee-profile">
            <span className="fb-assignee-profile-avatar" aria-hidden="true">
              {user.initials}
            </span>
            <span className="fb-assignee-profile-copy">
              <strong>{user.name}</strong>
              <span>{user.role}</span>
            </span>
          </div>
          <a className="fb-assignee-email" href={`mailto:${user.email}`}>
            <Mail size={13} aria-hidden="true" />
            {user.email}
          </a>
        </div>
      )}
    </div>
  )
}
