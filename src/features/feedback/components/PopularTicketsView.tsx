import { useMemo, useState } from 'react'
import { filterAndSortTickets } from '../data'
import type { Category, Ticket } from '../types'
import { CategoryFilterTabs } from './CategoryFilterTabs'
import { UserTicketList } from './UserTicketList'
import './ViewLayout.css'

// Only votable categories rank by popularity - reviews have no votes.
const POPULAR_CATEGORIES: Category[] = ['idea', 'bug']

type PopularTicketsViewProps = {
  tickets: Ticket[]
  onToggleLike: (id: string) => void
  onOpenTicket: (ticket: Ticket) => void
}

export function PopularTicketsView({ tickets, onToggleLike, onOpenTicket }: PopularTicketsViewProps) {
  const [category, setCategory] = useState<Category>(POPULAR_CATEGORIES[0])

  const popularTickets = useMemo(
    () => filterAndSortTickets(tickets.filter((ticket) => ticket.category === category), [], [], 'popular'),
    [tickets, category],
  )

  return (
    <div className="fb-user-ticket-view">
      <div className="fb-popular-category-tabs">
        <CategoryFilterTabs
          categories={POPULAR_CATEGORIES}
          value={category}
          onChange={(value) => value && setCategory(value)}
        />
      </div>
      <UserTicketList tickets={popularTickets} onToggleLike={onToggleLike} onOpenTicket={onOpenTicket} />
    </div>
  )
}
