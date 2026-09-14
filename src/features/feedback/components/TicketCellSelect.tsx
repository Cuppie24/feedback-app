import { X } from 'lucide-react'
import { useRef, useState } from 'react'
import { useDismissOnOutsideOrEscape } from '../hooks'
import type { TagTone } from '../types'
import { Tag } from './Tag'
import { SelectionMenu, type SelectionMenuOption } from './SelectionMenu'

export type TicketCellOption<T extends string> = SelectionMenuOption<T> & { tone: TagTone }

type TicketCellSelectProps<T extends string> = {
  label: string
  value: T | null
  options: TicketCellOption<T>[]
  onChange: (value: T | null) => void
}

export function TicketCellSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: TicketCellSelectProps<T>) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const selected = value ? options.find((option) => option.value === value) : null

  useDismissOnOutsideOrEscape(open, rootRef, setOpen)

  function closeMenu() {
    setOpen(false)
    requestAnimationFrame(() => triggerRef.current?.focus())
  }

  return (
    <div
      className="fb-ticket-cell-select"
      ref={rootRef}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        event.stopPropagation()
        if (event.key === 'Escape') {
          closeMenu()
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        className="fb-ticket-cell-trigger"
        aria-label={`${label}: ${selected?.label ?? 'Не выбрано'}`}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((current) => !current)}
      >
        {selected ? <Tag tone={selected.tone}>{selected.label}</Tag> : <span className="fb-ticket-cell-placeholder">Не выбрано</span>}
      </button>

      {open && (
        <SelectionMenu
          className="fb-ticket-cell-menu"
          label={label}
          options={options}
          selected={value ? [value] : []}
          multiple={false}
          required
          onChange={(next) => onChange(next[0] ?? null)}
          closeOnSelect
          onRequestClose={closeMenu}
          renderOption={(option) => <Tag tone={option.tone}>{option.label}</Tag>}
          renderSelectedValue={(option, { removable }) => (
            <Tag tone={option.tone}>
              {option.label}
              {removable && <X size={12} strokeWidth={2.5} />}
            </Tag>
          )}
        />
      )}
    </div>
  )
}
