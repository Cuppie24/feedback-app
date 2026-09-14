import { useMemo, useState } from 'react'
import type { Category, Status, Ticket } from '../types'
import { PageHeader } from './PageHeader'
import { SearchFilterBar, type TicketSort } from './SearchFilterBar'
import { TicketList } from './TicketList'
import './ViewLayout.css'

type AllTicketsViewProps = {
  tickets: Ticket[]
  onOpenTicket: (id: string) => void
  onToggleLike: (id: string) => void
}

export function AllTicketsView({ tickets, onOpenTicket, onToggleLike }: AllTicketsViewProps) {
  const [search, setSearch] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [statuses, setStatuses] = useState<Status[]>([])
  const [sort, setSort] = useState<TicketSort>('newest')

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    const matches = tickets.filter((ticket) => {
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

    if (sort === 'popular') return [...matches].sort((a, b) => b.likes - a.likes)
    if (sort === 'oldest') return [...matches].reverse()
    return matches
  }, [tickets, search, categories, statuses, sort])

  return (
    <div className="fb-view-wide">
      <PageHeader
        title="Все обращения"
        subtitle="Обращения от всех сотрудников."
      />

      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        categories={categories}
        onCategoriesChange={setCategories}
        statuses={statuses}
        onStatusesChange={setStatuses}
        sort={sort}
        onSortChange={setSort}
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
