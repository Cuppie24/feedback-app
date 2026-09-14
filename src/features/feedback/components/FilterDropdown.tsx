import { ChevronDown, X, type LucideIcon } from 'lucide-react'
import { useRef, useState } from 'react'
import { useDismissOnOutsideOrEscape } from '../hooks'
import type { TagTone } from '../types'
import { Tag } from './Tag'
import { SelectionMenu, type SelectionMenuOption } from './SelectionMenu'
import './FilterDropdown.css'

export type FilterOption<T extends string> = SelectionMenuOption<T> & {
  tone?: TagTone
  Icon?: LucideIcon
}

type FilterDropdownProps<T extends string> = {
  label: string
  Icon: LucideIcon
  options: FilterOption<T>[]
  selected: T[]
  onChange: (selected: T[]) => void
  wide?: boolean
}

export function FilterDropdown<T extends string>({ label, Icon, options, selected, onChange, wide = false }: FilterDropdownProps<T>) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const selectedLabels = selected
    .map((value) => options.find((option) => option.value === value)?.label)
    .filter((optionLabel): optionLabel is string => Boolean(optionLabel))
    .join(', ')

  useDismissOnOutsideOrEscape(open, rootRef, setOpen)

  function closeMenu() {
    setOpen(false)
    requestAnimationFrame(() => triggerRef.current?.focus())
  }

  return (
    <div className={`fb-filter${wide ? ' fb-filter-wide' : ''}`} ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`fb-filter-trigger${selected.length > 0 ? ' active' : ''}`}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Icon size={14} strokeWidth={3} />
        <span className="fb-filter-label">
          <span className="fb-filter-name">{label}</span>
          {selected.length > 0 && <span className="fb-filter-selection">: {selectedLabels}</span>}
        </span>
        <ChevronDown size={14} className="fb-filter-chevron" />
      </button>

      {open && (
        <SelectionMenu
          className="fb-filter-panel"
          label={label}
          options={options}
          selected={selected}
          multiple
          onChange={onChange}
          onRequestClose={closeMenu}
          selectedLayout={wide ? 'nowrap' : 'wrap'}
          renderOption={(option) =>
            option.tone ? (
              <Tag tone={option.tone}>
                {option.Icon && <option.Icon size={12} strokeWidth={2.5} />}
                {option.label}
              </Tag>
            ) : (
              option.label
            )
          }
          renderSelectedValue={(option, { removable }) =>
            option.tone ? (
              <Tag tone={option.tone}>
                {option.Icon && <option.Icon size={12} strokeWidth={2.5} />}
                {option.label}
                {removable && <X size={12} strokeWidth={2.5} />}
              </Tag>
            ) : (
              <span className="fb-selection-menu-chip-text">
                {option.label}
                {removable && <X size={12} strokeWidth={2.5} />}
              </span>
            )
          }
        />
      )}
    </div>
  )
}
