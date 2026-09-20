import { useMemo, useState } from 'react'
import { comparePopularity } from '../data'
import type { Status, System, Ticket } from '../types'
import { pluralizeRu } from '../utils'
import { PageHeader } from './PageHeader'
import { SearchFilterBar, type TicketSort } from './SearchFilterBar'
import { TicketList } from './TicketList'
import './ViewLayout.css'

type AllTicketsViewProps = {
  tickets: Ticket[]
  onToggleLike: (id: string) => void
  onSystemChange: (id: string, system: System | null) => void
  onStatusChange: (id: string, status: Status | null) => void
  onOpenTicket: (ticket: Ticket) => void
}

export function AllTicketsView({
  tickets,
  onToggleLike,
  onSystemChange,
  onStatusChange,
  onOpenTicket,
}: AllTicketsViewProps) {
  const [statuses, setStatuses] = useState<Status[]>([])
  const [systems, setSystems] = useState<System[]>([])
  const [sort, setSort] = useState<TicketSort>('newest')

  const filtered = useMemo(() => {
    const matches = tickets.filter((ticket) => {
      if (statuses.length > 0 && (ticket.status === null || !statuses.includes(ticket.status))) return false
      if (systems.length > 0 && (ticket.system === null || !systems.includes(ticket.system))) return false
      return true
    })

    if (sort === 'popular') return [...matches].sort(comparePopularity)
    if (sort === 'oldest') return [...matches].sort((a, b) => a.createdAt - b.createdAt)
    return [...matches].sort((a, b) => b.createdAt - a.createdAt)
  }, [tickets, statuses, systems, sort])

  return (
    <div className="fb-view-wide">
      <PageHeader
        title="Все обращения"
        subtitle="Обращения от всех сотрудников."
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
