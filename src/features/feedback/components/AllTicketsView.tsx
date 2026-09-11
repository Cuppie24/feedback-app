import { useMemo, useState } from 'react'
import type { Category, Status, Ticket } from '../types'
import { PageHeader } from './PageHeader'
import { SearchFilterBar } from './SearchFilterBar'
import { TicketList } from './TicketList'
import './ViewLayout.css'

type AllTicketsViewProps = {
  tickets: Ticket[]
  onOpenTicket: (id: string) => void
  onToggleLike: (id: string) => void
}

function ticketCountLabel(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return `${count} обращение`
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return `${count} обращения`
  return `${count} обращений`
}

export function AllTicketsView({ tickets, onOpenTicket, onToggleLike }: AllTicketsViewProps) {
  const [search, setSearch] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [statuses, setStatuses] = useState<Status[]>([])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return tickets.filter((ticket) => {
      if (categories.length > 0 && !categories.includes(ticket.category)) return false
      if (statuses.length > 0 && !statuses.includes(ticket.status)) return false
      if (!query) return true
      const snippet = ticket.messages.at(-1)?.text ?? ''
      return (
        ticket.title.toLowerCase().includes(query) ||
        snippet.toLowerCase().includes(query) ||
        ticket.author.toLowerCase().includes(query)
      )
    })
  }, [tickets, search, categories, statuses])

  return (
    <div className="fb-view-wide">
      <PageHeader
        title="Все обращения"
        subtitle="Обращения от всех сотрудников."
        meta={<span className="fb-page-count">{ticketCountLabel(tickets.length)}</span>}
      />

      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        categories={categories}
        onCategoriesChange={setCategories}
        statuses={statuses}
        onStatusesChange={setStatuses}
      />

      <TicketList
        tickets={filtered}
        variant="wide"
        showAuthor
        onOpen={onOpenTicket}
        onToggleLike={onToggleLike}
        emptyMessage="Ничего не найдено."
      />
    </div>
  )
}
