import { useMemo, useState } from 'react'
import { comparePopularity } from '../data'
import type { Category, Status, Ticket } from '../types'
import { pluralizeRu } from '../utils'
import { PageHeader } from './PageHeader'
import { SearchFilterBar, type TicketSort } from './SearchFilterBar'
import { TicketList } from './TicketList'
import './ViewLayout.css'

type MyTicketsViewProps = {
  tickets: Ticket[]
  onOpenTicket: (id: string) => void
  onToggleLike: (id: string) => void
}

export function MyTicketsView({ tickets, onOpenTicket, onToggleLike }: MyTicketsViewProps) {
  const [search, setSearch] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [statuses, setStatuses] = useState<Status[]>([])
  const [sort, setSort] = useState<TicketSort>('newest')

  const hasAny = tickets.some((ticket) => ticket.mine)

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    const matches = tickets.filter((ticket) => {
      if (!ticket.mine) return false
      if (categories.length > 0 && !categories.includes(ticket.category)) return false
      if (statuses.length > 0 && !statuses.includes(ticket.status)) return false
      if (!query) return true
      const snippet = ticket.messages.at(-1)?.text ?? ''
      return (
        ticket.id.toLowerCase().includes(query) ||
        ticket.title.toLowerCase().includes(query) ||
        snippet.toLowerCase().includes(query)
      )
    })

    if (sort === 'popular') return [...matches].sort(comparePopularity)
    if (sort === 'oldest') return [...matches].sort((a, b) => a.createdAt - b.createdAt)
    return [...matches].sort((a, b) => b.createdAt - a.createdAt)
  }, [tickets, search, categories, statuses, sort])

  return (
    <div className="fb-view-wide">
      <PageHeader
        title="Мои обращения"
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
        sort={sort}
        onSortChange={setSort}
      />

      <TicketList
        tickets={filtered}
        variant="wide"
        sort={sort}
        onSortChange={setSort}
        onOpen={onOpenTicket}
        onToggleLike={onToggleLike}
        emptyMessage={hasAny ? 'Ничего не найдено.' : 'Вы ещё не отправляли обращений.'}
      />
    </div>
  )
}
