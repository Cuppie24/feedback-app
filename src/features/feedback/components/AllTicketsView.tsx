import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Ticket } from '../types'
import { PageHeader } from './PageHeader'
import { TicketList } from './TicketList'
import './ViewLayout.css'
import './AllTicketsView.css'

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

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return tickets
    return tickets.filter((ticket) => {
      const snippet = ticket.messages.at(-1)?.text ?? ''
      return (
        ticket.title.toLowerCase().includes(query) ||
        snippet.toLowerCase().includes(query) ||
        ticket.author.toLowerCase().includes(query)
      )
    })
  }, [tickets, search])

  return (
    <div className="fb-view-wide">
      <PageHeader
        title="Все обращения"
        subtitle="Обращения от всех сотрудников."
        meta={<span className="fb-page-count">{ticketCountLabel(tickets.length)}</span>}
      />

      <div className="fb-search-field">
        <Search className="fb-search-icon" size={16} />
        <input
          className="fb-search-input"
          placeholder="Поиск по обращениям..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

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
