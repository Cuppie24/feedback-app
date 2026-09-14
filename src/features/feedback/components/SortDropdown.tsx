import { ArrowUpDown, Check, ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { TicketSort } from './SearchFilterBar'
import './FilterDropdown.css'

const SORT_OPTIONS: { value: TicketSort; label: string }[] = [
  { value: 'newest', label: 'Сначала новые' },
  { value: 'oldest', label: 'Сначала старые' },
  { value: 'popular', label: 'Популярные' },
]

type SortDropdownProps = {
  value: TicketSort
  onChange: (value: TicketSort) => void
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const selected = SORT_OPTIONS.find((option) => option.value === value) ?? SORT_OPTIONS[0]

  useEffect(() => {
    if (!open) return

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div className="fb-filter fb-sort-filter" ref={rootRef}>
      <button
        type="button"
        className="fb-filter-trigger"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Сортировка: ${selected.label}`}
      >
        <ArrowUpDown size={14} />
        <span className="fb-filter-label">{selected.label}</span>
        <ChevronDown size={14} className="fb-filter-chevron" />
      </button>

      {open && (
        <div className="fb-filter-panel" role="listbox" aria-label="Сортировка обращений">
          {SORT_OPTIONS.map((option) => {
            const checked = option.value === value
            return (
              <button
                key={option.value}
                type="button"
                className="fb-filter-option"
                role="option"
                aria-selected={checked}
                onClick={() => {
                  onChange(option.value)
                  setOpen(false)
                }}
              >
                <span>{option.label}</span>
                {checked && <Check className="fb-sort-selected" size={14} strokeWidth={2.5} />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
