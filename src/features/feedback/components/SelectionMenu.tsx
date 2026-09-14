import { X } from 'lucide-react'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import './SelectionMenu.css'

export type SelectionMenuOption<T extends string> = {
  value: T
  label: string
}

export type SelectionMenuSelectedValueContext = {
  removable: boolean
}

type SelectionMenuProps<T extends string, Option extends SelectionMenuOption<T>> = {
  label: string
  options: Option[]
  selected: T[]
  multiple: boolean
  required?: boolean
  onChange: (selected: T[]) => void
  closeOnSelect?: boolean
  onRequestClose?: () => void
  selectedLayout?: 'wrap' | 'nowrap'
  className?: string
  searchPlaceholder?: string
  emptyMessage?: string
  allSelectedMessage?: string
  renderOption?: (option: Option) => ReactNode
  renderSelectedValue?: (option: Option, context: SelectionMenuSelectedValueContext) => ReactNode
}

export function SelectionMenu<T extends string, Option extends SelectionMenuOption<T>>({
  label,
  options,
  selected,
  multiple,
  required = false,
  onChange,
  closeOnSelect = false,
  onRequestClose,
  selectedLayout = 'wrap',
  className = '',
  searchPlaceholder = 'Поиск...',
  emptyMessage = 'Ничего не найдено.',
  allSelectedMessage = 'Все варианты выбраны.',
  renderOption,
  renderSelectedValue,
}: SelectionMenuProps<T, Option>) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const activeOptionRef = useRef<HTMLDivElement>(null)
  const listboxId = useId()
  const optionByValue = new Map<T, Option>()
  const selectedValueSet = new Set<T>()
  const selectedOptions: Option[] = []

  options.forEach((option) => optionByValue.set(option.value, option))
  selected.forEach((value) => {
    const option = optionByValue.get(value)
    if (option && !selectedValueSet.has(value)) {
      selectedValueSet.add(value)
      selectedOptions.push(option)
    }
  })

  const normalizedQuery = query.trim().toLocaleLowerCase()
  const availableOptions = options.filter(
    (option) => !selectedValueSet.has(option.value) && option.label.toLocaleLowerCase().includes(normalizedQuery),
  )
  const activeOptionIndex = Math.min(activeIndex, Math.max(availableOptions.length - 1, 0))
  const activeOption = availableOptions[activeOptionIndex]
  const activeOptionId = activeOption ? `${listboxId}-${activeOption.value}` : undefined

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    activeOptionRef.current?.scrollIntoView({ block: 'nearest' })
  }, [activeOption])

  function resetSearch() {
    setQuery('')
    setActiveIndex(0)
  }

  function toggleValue(value: T) {
    if (multiple) {
      const next = selectedValueSet.has(value)
        ? selectedOptions.map((option) => option.value).filter((item) => item !== value)
        : [...selectedOptions.map((option) => option.value), value]
      onChange(next)
      resetSearch()
      inputRef.current?.focus()
      return
    }

    onChange([value])
    resetSearch()
    if (closeOnSelect) onRequestClose?.()
  }

  function removeValue(value: T) {
    if (required && selectedOptions.length === 1) return
    onChange(selectedOptions.map((option) => option.value).filter((item) => item !== value))
    setActiveIndex(0)
    inputRef.current?.focus()
  }

  function moveActive(direction: 1 | -1) {
    setActiveIndex((current) => Math.max(0, Math.min(current + direction, availableOptions.length - 1)))
  }

  return (
    <div className={`fb-selection-menu ${className}${selectedOptions.length > 0 ? ' has-selection' : ''}`}>
      <div className={`fb-selection-menu-selected${selectedLayout === 'nowrap' ? ' no-wrap' : ''}`} role="group" aria-label={`Выбрано: ${label}`}>
        {selectedOptions.map((option) => {
          const removable = !required || selectedOptions.length > 1

          return removable ? (
            <button
              key={option.value}
              type="button"
              className="fb-selection-menu-chip"
              onClick={() => removeValue(option.value)}
              aria-label={`Удалить: ${option.label}`}
            >
              {renderSelectedValue ? (
                renderSelectedValue(option, { removable })
              ) : (
                <span className="fb-selection-menu-chip-text">
                  {option.label}
                  <X size={12} strokeWidth={2.5} />
                </span>
              )}
            </button>
          ) : (
            <span key={option.value} className="fb-selection-menu-chip static">
              {renderSelectedValue ? renderSelectedValue(option, { removable }) : <span className="fb-selection-menu-chip-text">{option.label}</span>}
            </span>
          )
        })}
        <input
          ref={inputRef}
          type="search"
          className="fb-selection-menu-input"
          role="combobox"
          aria-label={`Поиск: ${label}`}
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-activedescendant={activeOptionId}
          aria-expanded="true"
          placeholder={searchPlaceholder}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setActiveIndex(0)
          }}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown') {
              event.preventDefault()
              moveActive(1)
              return
            }

            if (event.key === 'ArrowUp') {
              event.preventDefault()
              moveActive(-1)
              return
            }

            if (event.key === 'Home') {
              event.preventDefault()
              setActiveIndex(0)
              return
            }

            if (event.key === 'End') {
              event.preventDefault()
              setActiveIndex(Math.max(availableOptions.length - 1, 0))
              return
            }

            if (event.key === 'Enter' && activeOption) {
              event.preventDefault()
              toggleValue(activeOption.value)
              return
            }

            if (event.key === 'Escape') {
              event.preventDefault()
              event.stopPropagation()
              onRequestClose?.()
            }
          }}
        />
      </div>
      <div className="fb-selection-menu-divider" />

      <p className="fb-selection-menu-hint">Выберите вариант</p>

      <div id={listboxId} className="fb-selection-menu-options" role="listbox" aria-label={`Варианты: ${label}`}>
        {availableOptions.map((option, index) => (
          <div
            key={option.value}
            ref={index === activeOptionIndex ? activeOptionRef : undefined}
            id={`${listboxId}-${option.value}`}
            className={`fb-selection-menu-option${index === activeOptionIndex ? ' active' : ''}`}
            role="option"
            aria-selected={false}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => toggleValue(option.value)}
          >
            {renderOption ? renderOption(option) : option.label}
          </div>
        ))}
        {availableOptions.length === 0 && (
          <p className="fb-selection-menu-empty" role="status">
            {selectedOptions.length === options.length ? allSelectedMessage : emptyMessage}
          </p>
        )}
      </div>
    </div>
  )
}
