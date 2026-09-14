import { ListFilter, Search, Tag as TagIcon, X } from 'lucide-react'
import { CATEGORY_ICON, CATEGORY_LABEL, CATEGORY_TONE, STATUS_LABEL } from '../data'
import type { Category, Status } from '../types'
import { FilterDropdown } from './FilterDropdown'
import { SortDropdown } from './SortDropdown'
import './SearchFilterBar.css'

const CATEGORY_OPTIONS = (Object.entries(CATEGORY_LABEL) as [Category, string][]).map(([value, label]) => ({
  value,
  label,
  tone: CATEGORY_TONE[value],
  Icon: CATEGORY_ICON[value],
}))

const STATUS_OPTIONS = (Object.entries(STATUS_LABEL) as [Status, string][]).map(([value, label]) => ({
  value,
  label,
}))

export type SearchFilterBarProps = {
  search: string
  onSearchChange: (value: string) => void
  categories: Category[]
  onCategoriesChange: (value: Category[]) => void
  statuses: Status[]
  onStatusesChange: (value: Status[]) => void
  sort: TicketSort
  onSortChange: (value: TicketSort) => void
}

export type TicketSort = 'newest' | 'oldest' | 'popular'

export function SearchFilterBar({
  search,
  onSearchChange,
  categories,
  onCategoriesChange,
  statuses,
  onStatusesChange,
  sort,
  onSortChange,
}: SearchFilterBarProps) {
  const hasActiveFilters = categories.length > 0 || statuses.length > 0 || search.trim().length > 0

  function clearAll() {
    onSearchChange('')
    onCategoriesChange([])
    onStatusesChange([])
  }

  return (
    <div className="fb-database-toolbar">
      <div className="fb-filter-bar">
        <div className="fb-search-field">
          <Search className="fb-search-icon" size={15} strokeWidth={3} />
          <input
            className="fb-search-input"
            type="search"
            aria-label="Поиск по обращениям"
            placeholder="Поиск..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>

        <FilterDropdown
          label="Категория"
          Icon={TagIcon}
          options={CATEGORY_OPTIONS}
          selected={categories}
          onChange={onCategoriesChange}
        />

        <FilterDropdown
          label="Статус"
          Icon={ListFilter}
          options={STATUS_OPTIONS}
          selected={statuses}
          onChange={onStatusesChange}
        />

        {hasActiveFilters && (
          <button type="button" className="fb-filter-clear" onClick={clearAll}>
            <X size={14} />
            Сбросить
          </button>
        )}

        <SortDropdown value={sort} onChange={onSortChange} />
      </div>
    </div>
  )
}
