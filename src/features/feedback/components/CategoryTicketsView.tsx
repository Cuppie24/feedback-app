import { useMemo, useState } from 'react'
import { CATEGORY_ICON, CATEGORY_TONE, filterAndSortTickets, getCategoryLabel } from '../data'
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
    const inCategory = tickets.filter((ticket) => ticket.category === category)
    return filterAndSortTickets(inCategory, statuses, systems, sort)
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
