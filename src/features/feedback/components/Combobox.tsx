import { Check, ChevronDown, type LucideIcon } from 'lucide-react'
import { useRef, useState, type ReactNode } from 'react'
import { useDismissOnOutsideOrEscape } from '../hooks'
import './Combobox.css'

export type ComboboxOption<T extends string> = {
  value: T
  label: string
}

type ComboboxProps<T extends string, Option extends ComboboxOption<T>> = {
  label: string
  Icon?: LucideIcon
  options: Option[]
  selected: T[]
  multiple: boolean
  onChange: (selected: T[]) => void
  className?: string
  highlightSelected?: boolean
  renderOption?: (option: Option, selected: boolean) => ReactNode
}

export function Combobox<T extends string, Option extends ComboboxOption<T>>({
  label,
  Icon,
  options,
  selected,
  multiple,
  onChange,
  className = '',
  highlightSelected = true,
  renderOption,
}: ComboboxProps<T, Option>) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const selectedSet = new Set(selected)
  const selectedLabels = options
    .filter((option) => selectedSet.has(option.value))
    .map((option) => option.label)
    .join(', ')

  useDismissOnOutsideOrEscape(open, rootRef, setOpen)

  function select(value: T) {
    if (multiple) {
      onChange(selectedSet.has(value) ? selected.filter((item) => item !== value) : [...selected, value])
      return
    }

    onChange([value])
    setOpen(false)
  }

  return (
    <div className={`fb-combobox ${className}`} ref={rootRef}>
      <button
        type="button"
        className={`fb-combobox-trigger${selected.length > 0 && highlightSelected ? ' active' : ''}`}
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={selectedLabels ? `${label}: ${selectedLabels}` : label}
      >
        {Icon && <Icon size={14} strokeWidth={3} />}
        <span className="fb-combobox-label">
          <span className="fb-combobox-name">{label}</span>
          {selectedLabels && <span className="fb-combobox-selection">: {selectedLabels}</span>}
        </span>
        <ChevronDown size={14} className="fb-combobox-chevron" />
      </button>

      {open && (
        <div className="fb-combobox-menu" role="listbox" aria-label={label} aria-multiselectable={multiple || undefined}>
          {options.map((option) => {
            const isSelected = selectedSet.has(option.value)

            return (
              <button
                key={option.value}
                type="button"
                className={`fb-combobox-option${isSelected && highlightSelected ? ' selected' : ''}`}
                role="option"
                aria-selected={isSelected}
                onClick={() => select(option.value)}
              >
                <span className="fb-combobox-option-label">{renderOption ? renderOption(option, isSelected) : option.label}</span>
                {isSelected && <Check className="fb-combobox-check" size={14} strokeWidth={2.5} />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
