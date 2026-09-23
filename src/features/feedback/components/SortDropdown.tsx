import { ArrowUpDown } from 'lucide-react'
import type { TicketSort } from './SearchFilterBar'
import { Combobox } from './Combobox'

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
  return (
    <Combobox
      label="Сортировка"
      Icon={ArrowUpDown}
      options={SORT_OPTIONS}
      selected={[value]}
      multiple={false}
      onChange={([next]) => onChange(next ?? value)}
      className="fb-sort-combobox"
      highlightSelected={false}
    />
  )
}
