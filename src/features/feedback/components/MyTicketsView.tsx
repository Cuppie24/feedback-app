import { useMemo, useState } from 'react'
import { comparePopularity } from '../data'
import type { Category, Status, System, Ticket } from '../types'
import { pluralizeRu } from '../utils'
import { PageHeader } from './PageHeader'
import { SearchFilterBar, type TicketSort } from './SearchFilterBar'
import { UserTicketList } from './UserTicketList'
import './ViewLayout.css'

type MyTicketsViewProps = {
  tickets: Ticket[]
  onOpenTicket: (ticket: Ticket) => void
}

export function MyTicketsView({
  tickets,
  onOpenTicket,
}: MyTicketsViewProps) {
  const [search, setSearch] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [statuses, setStatuses] = useState<Status[]>([])
  const [systems, setSystems] = useState<System[]>([])
  const [sort, setSort] = useState<TicketSort>('newest')

  const hasAny = tickets.some((ticket) => ticket.mine)

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    const matches = tickets.filter((ticket) => {
      if (!ticket.mine) return false
      if (categories.length > 0 && !categories.includes(ticket.category)) return false
      if (statuses.length > 0 && (ticket.status === null || !statuses.includes(ticket.status))) return false
      if (systems.length > 0 && (ticket.system === null || !systems.includes(ticket.system))) return false
      if (!query) return true
      const snippet = ticket.messages.at(-1)?.text ?? ''
      return (
        ticket.id.toLowerCase().includes(query) ||
        ticket.title.toLowerCase().includes(query) ||
        snippet.toLowerCase().includes(query) ||
        ticket.assignee?.name.toLowerCase().includes(query)
      )
    })

    if (sort === 'popular') return [...matches].sort(comparePopularity)
    if (sort === 'oldest') return [...matches].sort((a, b) => a.createdAt - b.createdAt)
    return [...matches].sort((a, b) => b.createdAt - a.createdAt)
  }, [tickets, search, categories, statuses, systems, sort])

  return (
    <div className="fb-user-ticket-view">
      <PageHeader
        subtitle="Обращения, которые вы отправили."
        meta={
          <span className="fb-page-count">
            {filtered.length} {pluralizeRu(filtered.length, 'обращение', 'обращения', 'обращений')}
          </span>
        }
      />

      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        categories={categories}
        onCategoriesChange={setCategories}
        statuses={statuses}
        onStatusesChange={setStatuses}
        systems={systems}
        onSystemsChange={setSystems}
        sort={sort}
        onSortChange={setSort}
      />

      <UserTicketList
        tickets={filtered}
        onOpenTicket={onOpenTicket}
        emptyMessage={hasAny ? 'Ничего не найдено.' : 'Вы ещё не отправляли обращений.'}
      />
    </div>
  )
}
