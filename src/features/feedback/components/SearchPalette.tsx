import { Search } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { CATEGORY_ICON, CATEGORY_TONE, STATUS_LABEL, STATUS_TONE } from '../data'
import type { Ticket } from '../types'
import { Tag } from './Tag'
import './SearchPalette.css'

type SearchPaletteProps = {
  open: boolean
  query: string
  onQueryChange: (value: string) => void
  onOpen: () => void
  onClose: () => void
  tickets: Ticket[]
  onSelectTicket: (ticket: Ticket) => void
}

const RESULT_LIMIT = 12

function isMac() {
  return /Mac|iPod|iPhone|iPad/.test(navigator.platform)
}

function matchesQuery(ticket: Ticket, query: string): boolean {
  const snippet = ticket.messages.at(-1)?.text ?? ''
  return (
    ticket.id.toLowerCase().includes(query) ||
    ticket.title.toLowerCase().includes(query) ||
    snippet.toLowerCase().includes(query) ||
    ticket.author.name.toLowerCase().includes(query) ||
    (ticket.assignee?.name.toLowerCase().includes(query) ?? false)
  )
}

// Floating trigger (top-left of UserShell, mirroring ThemeToggle/ModeSwitch's
// corner on the right) plus the Ctrl/Cmd+K overlay it opens - see
// UserShell.tsx. Searches every ticket user mode can show (the same set
// PopularTicketsView lists, not just "mine"), since the tab bar has no room
// left for a persistent search field. Open/query state lives in
// useSearchPalette (hooks.ts) so the shell owns it the same way it owns
// theme/mode.
export function SearchPalette({ open, query, onQueryChange, onOpen, onClose, tickets, onSelectTicket }: SearchPaletteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const listboxId = useId()

  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase()
    if (!trimmed) return []
    return tickets
      .filter((ticket) => matchesQuery(ticket, trimmed))
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, RESULT_LIMIT)
  }, [tickets, query])

  const activeTicket = results[activeIndex]

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  function onInputKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((prev) => Math.min(prev + 1, Math.max(results.length - 1, 0)))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((prev) => Math.max(prev - 1, 0))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      if (activeTicket) onSelectTicket(activeTicket)
    }
  }

  return (
    <>
      <button
        type="button"
        className="fb-search-trigger"
        onClick={onOpen}
        aria-label={`Поиск по обращениям. Сочетание клавиш ${isMac() ? 'Cmd+K' : 'Ctrl+K'}`}
        title="Поиск по обращениям"
      >
        <Search size={15} aria-hidden="true" />
        <span className="fb-search-trigger-label">Поиск</span>
        <kbd className="fb-search-trigger-kbd" aria-hidden="true">
          {isMac() ? 'Cmd+K' : 'Ctrl+K'}
        </kbd>
      </button>

      {open &&
        createPortal(
          <div
            className="fb-search-backdrop"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) onClose()
            }}
          >
            <div className="fb-search-dialog" role="dialog" aria-modal="true" aria-label="Поиск по обращениям">
              <div className="fb-search-input-row">
                <Search size={16} aria-hidden="true" />
                <input
                  ref={inputRef}
                  type="search"
                  className="fb-search-dialog-input"
                  aria-label="Поиск по обращениям"
                  aria-controls={listboxId}
                  aria-activedescendant={activeTicket ? `${listboxId}-${activeTicket.id}` : undefined}
                  placeholder="Номер, тема, автор..."
                  value={query}
                  onChange={(event) => {
                    onQueryChange(event.target.value)
                    setActiveIndex(0)
                  }}
                  onKeyDown={onInputKeyDown}
                />
                <kbd className="fb-search-kbd-hint">Esc</kbd>
              </div>

              <div className="fb-search-results">
                {query.trim() === '' && (
                  <p className="fb-search-empty">Начните вводить, чтобы найти обращение по номеру, теме или автору.</p>
                )}
                {query.trim() !== '' && results.length === 0 && (
                  <p className="fb-search-empty">Ничего не найдено по «{query.trim()}».</p>
                )}
                <div role="listbox" id={listboxId} aria-label="Результаты поиска">
                  {results.map((ticket, index) => {
                    const Icon = CATEGORY_ICON[ticket.category]
                    return (
                      <button
                        key={ticket.id}
                        id={`${listboxId}-${ticket.id}`}
                        type="button"
                        role="option"
                        aria-selected={index === activeIndex}
                        className={`fb-search-result${index === activeIndex ? ' active' : ''}`}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => onSelectTicket(ticket)}
                      >
                        <Icon className={`fb-search-result-icon-${CATEGORY_TONE[ticket.category]}`} size={16} aria-hidden="true" />
                        <span className="fb-search-result-body">
                          <span className="fb-search-result-title">{ticket.title}</span>
                          <span className="fb-search-result-meta">
                            <span>{ticket.id}</span>
                            <span>·</span>
                            <span>{ticket.mine ? 'Моё обращение' : ticket.author.name}</span>
                          </span>
                        </span>
                        {ticket.status && <Tag tone={STATUS_TONE[ticket.status]}>{STATUS_LABEL[ticket.status]}</Tag>}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
