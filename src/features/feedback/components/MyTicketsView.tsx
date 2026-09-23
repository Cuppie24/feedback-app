import { useMemo, useState } from 'react'
import { filterAndSortTickets } from '../data'
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
    const mine = tickets.filter((ticket) => {
      if (!ticket.mine) return false
      if (category !== null && ticket.category !== category) return false
      return true
    })
    return filterAndSortTickets(mine, statuses, systems, sort)
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
      />

      <UserTicketList
        tickets={filtered}
        onOpenTicket={onOpenTicket}
        emptyMessage={hasAny ? 'Ничего не найдено.' : 'Вы ещё не отправляли обращений.'}
      />
    </div>
  )
}
