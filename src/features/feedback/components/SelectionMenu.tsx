import { MoreHorizontal, X, type LucideIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { TagTone } from '../types'
import { Tag } from './Tag'
import './SelectionMenu.css'

export type SelectionMenuOption<T extends string> = {
  value: T
  label: string
  tone?: TagTone
  Icon?: LucideIcon
}

type SelectionMenuProps<T extends string> = {
  label: string
  options: SelectionMenuOption<T>[]
  selected: T[]
  multiple: boolean
  required?: boolean
  onChange: (selected: T[]) => void
  onSingleSelect?: () => void
  noWrapSelected?: boolean
  className: string
}

export function SelectionMenu<T extends string>({
  label,
  options,
  selected,
  multiple,
  required = false,
  onChange,
  onSingleSelect,
  noWrapSelected = false,
  className,
}: SelectionMenuProps<T>) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const selectedOptions = selected
    .map((value) => options.find((option) => option.value === value))
    .filter((option): option is SelectionMenuOption<T> => Boolean(option))

  function toggleValue(value: T) {
    if (multiple) {
      onChange(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value])
      setQuery('')
      setActiveIndex(0)
      inputRef.current?.focus()
      return
    }

    onChange(selected[0] === value ? selected : [value])
    setQuery('')
    setActiveIndex(0)
    onSingleSelect?.()
  }

  function removeValue(value: T) {
    if (required && selected.length === 1) return
    onChange(selected.filter((item) => item !== value))
  }

  const normalizedQuery = query.trim().toLowerCase()
  const availableOptions = options.filter(
    (option) => !selected.includes(option.value) && option.label.toLowerCase().includes(normalizedQuery),
  )
  const activeOptionIndex = Math.min(activeIndex, Math.max(availableOptions.length - 1, 0))
  const activeOption = availableOptions[activeOptionIndex]

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <div
      className={`fb-selection-menu ${className}${selectedOptions.length > 0 ? ' has-selection' : ''}`}
      role="listbox"
      aria-label={label}
      aria-multiselectable={multiple || undefined}
    >
      <div className={`fb-selection-menu-selected${noWrapSelected ? ' no-wrap' : ''}`} aria-label={`Выбрано: ${label}`}>
        {selectedOptions.map((option) => {
          const canRemove = !required || selectedOptions.length > 1
          const chip = option.tone ? (
            <Tag tone={option.tone}>
              {option.Icon && <option.Icon size={12} strokeWidth={2.5} />}
              {option.label}
              {canRemove && <X size={12} strokeWidth={2.5} />}
            </Tag>
          ) : (
            <span className="fb-selection-menu-chip-text">
              {option.label}
              {canRemove && <X size={12} strokeWidth={2.5} />}
            </span>
          )

          return canRemove ? (
            <button
              key={option.value}
              type="button"
              className="fb-selection-menu-chip"
              onClick={() => removeValue(option.value)}
              aria-label={`Удалить: ${option.label}`}
            >
              {chip}
            </button>
          ) : (
            <span key={option.value} className="fb-selection-menu-chip static">
              {chip}
            </span>
          )
        })}
        <input
          ref={inputRef}
          type="search"
          className="fb-selection-menu-input"
          aria-label={`Поиск: ${label}`}
          placeholder="Поиск..."
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setActiveIndex(0)
          }}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown') {
              event.preventDefault()
              setActiveIndex((current) => Math.min(current + 1, Math.max(availableOptions.length - 1, 0)))
              return
            }

            if (event.key === 'ArrowUp') {
              event.preventDefault()
              setActiveIndex((current) => Math.max(current - 1, 0))
              return
            }

            if (event.key === 'Enter' && activeOption) {
              event.preventDefault()
              toggleValue(activeOption.value)
            }
          }}
        />
      </div>
      <div className="fb-selection-menu-divider" />

      <p className="fb-selection-menu-hint">Выберите вариант</p>

      <div className="fb-selection-menu-options">
        {availableOptions.map((option, index) => {
          return (
            <div key={option.value} className={`fb-selection-menu-row${index === activeOptionIndex ? ' active' : ''}`}>
              <button
                type="button"
                className="fb-selection-menu-option"
                role="option"
                aria-selected={false}
                onClick={() => toggleValue(option.value)}
              >
                {option.tone ? (
                  <Tag tone={option.tone}>
                    {option.Icon && <option.Icon size={12} strokeWidth={2.5} />}
                    {option.label}
                  </Tag>
                ) : (
                  option.label
                )}
              </button>
              <button
                type="button"
                className="fb-selection-menu-more"
                aria-label={`Дополнительные действия: ${option.label}`}
              >
                <MoreHorizontal size={16} />
              </button>
            </div>
          )
        })}
        {availableOptions.length === 0 && <p className="fb-selection-menu-empty">Ничего не найдено.</p>}
      </div>
    </div>
  )
}
