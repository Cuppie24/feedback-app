import { useMemo, useState } from 'react'
import { CATEGORY_ICON, CATEGORY_TONE, comparePopularity, getCategoryLabel } from '../data'
import type { Category, Status, System, Ticket } from '../types'
import { pluralizeRu } from '../utils'
import { PageHeader } from './PageHeader'
import { SearchFilterBar, type TicketSort } from './SearchFilterBar'
import { TicketList } from './TicketList'
import './ViewLayout.css'

type CategoryTicketsViewProps = {
  category: Category
  tickets: Ticket[]
  onToggleLike: (id: string) => void
  onSystemChange: (id: string, system: System | null) => void
  onStatusChange: (id: string, status: Status | null) => void
  onOpenTicket: (ticket: Ticket) => void
}

export function CategoryTicketsView({
  category,
  tickets,
  onToggleLike,
  onSystemChange,
  onStatusChange,
  onOpenTicket,
}: CategoryTicketsViewProps) {
  const [statuses, setStatuses] = useState<Status[]>([])
  const [systems, setSystems] = useState<System[]>([])
  const [sort, setSort] = useState<TicketSort>('newest')
  const CategoryIcon = CATEGORY_ICON[category]

  const filtered = useMemo(() => {
    const matches = tickets.filter((ticket) => {
      if (ticket.category !== category) return false
      if (statuses.length > 0 && (ticket.status === null || !statuses.includes(ticket.status))) return false
      if (systems.length > 0 && (ticket.system === null || !systems.includes(ticket.system))) return false
      return true
    })

    if (sort === 'popular') return [...matches].sort(comparePopularity)
    if (sort === 'oldest') return [...matches].sort((a, b) => a.createdAt - b.createdAt)
    return [...matches].sort((a, b) => b.createdAt - a.createdAt)
  }, [tickets, category, statuses, systems, sort])

  return (
    <div className="fb-view-wide">
      <PageHeader
        title={getCategoryLabel(category)}
        icon={
          <CategoryIcon
            className={`fb-page-title-icon fb-page-title-icon-${CATEGORY_TONE[category]}`}
            size={28}
          />
        }
        subtitle="Обращения выбранной категории."
        meta={
          <span className="fb-page-count">
            {filtered.length} {pluralizeRu(filtered.length, 'обращение', 'обращения', 'обращений')}
          </span>
        }
      />

      <SearchFilterBar
        statuses={statuses}
        onStatusesChange={setStatuses}
        systems={systems}
        onSystemsChange={setSystems}
        sort={sort}
        onSortChange={setSort}
      />

      <TicketList
        tickets={filtered}
        variant="wide"
        showAuthor
        showCategory={false}
        sort={sort}
        onSortChange={setSort}
        onToggleLike={onToggleLike}
        onSystemChange={onSystemChange}
        onStatusChange={onStatusChange}
        onOpenTicket={onOpenTicket}
        emptyMessage="Ничего не найдено."
      />
    </div>
  )
}
