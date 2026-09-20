import { useMemo } from 'react'
import { comparePopularity } from '../data'
import type { Ticket } from '../types'
import { pluralizeRu } from '../utils'
import { PageHeader } from './PageHeader'
import { UserTicketList } from './UserTicketList'
import './ViewLayout.css'

type PopularTicketsViewProps = {
  tickets: Ticket[]
  onToggleLike: (id: string) => void
  onOpenTicket: (ticket: Ticket) => void
}

export function PopularTicketsView({ tickets, onToggleLike, onOpenTicket }: PopularTicketsViewProps) {
  const popularTickets = useMemo(() => [...tickets].sort(comparePopularity), [tickets])

  return (
    <div className="fb-user-ticket-view">
      <PageHeader
        subtitle="Самые поддерживаемые обращения от коллег."
        meta={
          <span className="fb-page-count">
            {popularTickets.length} {pluralizeRu(popularTickets.length, 'обращение', 'обращения', 'обращений')}
          </span>
        }
      />
      <UserTicketList tickets={popularTickets} onToggleLike={onToggleLike} onOpenTicket={onOpenTicket} />
    </div>
  )
}
