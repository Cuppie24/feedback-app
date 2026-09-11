import { Check, ChevronDown, type LucideIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import './FilterDropdown.css'

export type FilterOption<T extends string> = {
  value: T
  label: string
}

type FilterDropdownProps<T extends string> = {
  label: string
  Icon: LucideIcon
  options: FilterOption<T>[]
  selected: T[]
  onChange: (selected: T[]) => void
}

export function FilterDropdown<T extends string>({ label, Icon, options, selected, onChange }: FilterDropdownProps<T>) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

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

  function toggleValue(value: T) {
    onChange(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value])
  }

  return (
    <div className="fb-filter" ref={rootRef}>
      <button
        type="button"
        className={`fb-filter-trigger${selected.length > 0 ? ' active' : ''}`}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Icon size={14} />
        <span>{label}</span>
        {selected.length > 0 && <span className="fb-filter-count">{selected.length}</span>}
        <ChevronDown size={14} className="fb-filter-chevron" />
      </button>

      {open && (
        <div className="fb-filter-panel" role="listbox" aria-multiselectable="true">
          {options.map((option) => {
            const checked = selected.includes(option.value)
            return (
              <button
                key={option.value}
                type="button"
                className="fb-filter-option"
                role="option"
                aria-selected={checked}
                onClick={() => toggleValue(option.value)}
              >
                <span className={`fb-filter-check${checked ? ' checked' : ''}`}>
                  {checked && <Check size={12} strokeWidth={3} />}
                </span>
                {option.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
