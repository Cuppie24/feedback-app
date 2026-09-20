import { useMemo, useState } from 'react'
import { comparePopularity, hasUnreadMessages } from '../data'
import type { Category, Status, System, Ticket } from '../types'
import { CategoryFilterTabs } from './CategoryFilterTabs'
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
  const [category, setCategory] = useState<Category>('bug')
  const [statuses, setStatuses] = useState<Status[]>([])
  const [systems, setSystems] = useState<System[]>([])
  const [sort, setSort] = useState<TicketSort>('newest')

  const hasAny = tickets.some((ticket) => ticket.mine)

  const filtered = useMemo(() => {
    const matches = tickets.filter((ticket) => {
      if (!ticket.mine) return false
      if (category !== null && ticket.category !== category) return false
      if (statuses.length > 0 && (ticket.status === null || !statuses.includes(ticket.status))) return false
      if (systems.length > 0 && (ticket.system === null || !systems.includes(ticket.system))) return false
      return true
    })

    if (sort === 'popular') return [...matches].sort(comparePopularity)
    if (sort === 'oldest') return [...matches].sort((a, b) => a.createdAt - b.createdAt)
    if (sort === 'unread') {
      return [...matches].sort((a, b) => Number(hasUnreadMessages(b)) - Number(hasUnreadMessages(a)) || b.createdAt - a.createdAt)
    }
    return [...matches].sort((a, b) => b.createdAt - a.createdAt)
  }, [tickets, category, statuses, systems, sort])

  return (
    <div className="fb-user-ticket-view">
      <div className="fb-my-tickets-category-tabs">
        <CategoryFilterTabs value={category} onChange={(value) => value && setCategory(value)} />
      </div>

      <SearchFilterBar
        statuses={statuses}
        onStatusesChange={setStatuses}
        systems={systems}
        onSystemsChange={setSystems}
        sort={sort}
        onSortChange={setSort}
        showUnreadSort
      />

      <UserTicketList
        tickets={filtered}
        onOpenTicket={onOpenTicket}
        emptyMessage={hasAny ? 'Ничего не найдено.' : 'Вы ещё не отправляли обращений.'}
      />
    </div>
  )
}
