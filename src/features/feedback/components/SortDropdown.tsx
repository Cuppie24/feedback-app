import { ArrowUpDown, Check, ChevronDown } from 'lucide-react'
import { useRef, useState } from 'react'
import { useDismissOnOutsideOrEscape } from '../hooks'
import type { TicketSort } from './SearchFilterBar'
import './FilterDropdown.css'

const SORT_OPTIONS: { value: TicketSort; label: string }[] = [
  { value: 'newest', label: 'Сначала новые' },
  { value: 'oldest', label: 'Сначала старые' },
  { value: 'popular', label: 'Больше голосов' },
]

type SortDropdownProps = {
  value: TicketSort
  onChange: (value: TicketSort) => void
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const selected = SORT_OPTIONS.find((option) => option.value === value) ?? SORT_OPTIONS[0]

  useDismissOnOutsideOrEscape(open, rootRef, setOpen)

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
