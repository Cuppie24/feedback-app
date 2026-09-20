import { ArrowUpDown } from 'lucide-react'
import type { TicketSort } from './SearchFilterBar'
import { Combobox } from './Combobox'

const SORT_OPTIONS: { value: TicketSort; label: string }[] = [
  { value: 'newest', label: 'Сначала новые' },
  { value: 'oldest', label: 'Сначала старые' },
  { value: 'popular', label: 'Больше голосов' },
]

const UNREAD_SORT_OPTION: { value: TicketSort; label: string } = { value: 'unread', label: 'Сначала непрочитанные' }

type SortDropdownProps = {
  value: TicketSort
  onChange: (value: TicketSort) => void
  showUnreadOption?: boolean
}

export function SortDropdown({ value, onChange, showUnreadOption = false }: SortDropdownProps) {
  const options = showUnreadOption ? [...SORT_OPTIONS, UNREAD_SORT_OPTION] : SORT_OPTIONS

  return (
    <Combobox
      label="Сортировка"
      Icon={ArrowUpDown}
      options={options}
      selected={[value]}
      multiple={false}
      onChange={([next]) => onChange(next ?? value)}
      className="fb-sort-combobox"
      highlightSelected={false}
    />
  )
}
