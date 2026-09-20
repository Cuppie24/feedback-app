import { Layers, ListFilter, X } from 'lucide-react'
import { STATUS_LABEL, STATUS_TONE, SYSTEM_LABEL, SYSTEM_TONE } from '../data'
import type { Status, System, TagTone } from '../types'
import { Combobox, type ComboboxOption } from './Combobox'
import { SortDropdown } from './SortDropdown'
import { Tag } from './Tag'
import './SearchFilterBar.css'

const STATUS_OPTIONS = (Object.entries(STATUS_LABEL) as [Status, string][]).map(([value, label]) => ({
  value,
  label,
  tone: STATUS_TONE[value],
}))

const SYSTEM_OPTIONS = (Object.entries(SYSTEM_LABEL) as [System, string][]).map(([value, label]) => ({
  value,
  label,
  tone: SYSTEM_TONE[value],
}))

export type SearchFilterBarProps = {
  statuses: Status[]
  onStatusesChange: (value: Status[]) => void
  systems: System[]
  onSystemsChange: (value: System[]) => void
  sort: TicketSort
  onSortChange: (value: TicketSort) => void
  showUnreadSort?: boolean
}

export type TicketSort = 'newest' | 'oldest' | 'popular' | 'unread'

export function SearchFilterBar({
  statuses,
  onStatusesChange,
  systems,
  onSystemsChange,
  sort,
  onSortChange,
  showUnreadSort = false,
}: SearchFilterBarProps) {
  const hasActiveFilters = statuses.length > 0 || systems.length > 0

  function clearAll() {
    onStatusesChange([])
    onSystemsChange([])
  }

  return (
    <div className="fb-database-toolbar">
      <div className="fb-filter-bar">
        <Combobox
          label="Статус"
          Icon={ListFilter}
          options={STATUS_OPTIONS}
          selected={statuses}
          onChange={onStatusesChange}
          multiple
          renderOption={renderFilterOption}
        />

        <Combobox
          label="Система"
          Icon={Layers}
          options={SYSTEM_OPTIONS}
          selected={systems}
          onChange={onSystemsChange}
          multiple
          renderOption={renderFilterOption}
        />

        {hasActiveFilters && (
          <button type="button" className="fb-filter-clear" onClick={clearAll}>
            <X size={14} />
            Сбросить
          </button>
        )}

        <SortDropdown value={sort} onChange={onSortChange} showUnreadOption={showUnreadSort} />
      </div>
    </div>
  )
}

function renderFilterOption<T extends string>(option: ComboboxOption<T> & { tone?: TagTone }) {
  return option.tone ? (
    <Tag tone={option.tone}>
      {option.label}
    </Tag>
  ) : (
    option.label
  )
}
