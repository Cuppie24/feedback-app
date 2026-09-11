import type { Ticket } from '../types'
import { PageHeader } from './PageHeader'
import { TicketList } from './TicketList'
import './ViewLayout.css'

type MyTicketsViewProps = {
  tickets: Ticket[]
  onOpenTicket: (id: string) => void
  onToggleLike: (id: string) => void
}

export function MyTicketsView({ tickets, onOpenTicket, onToggleLike }: MyTicketsViewProps) {
  const mine = tickets.filter((ticket) => ticket.mine)

  return (
    <div className="fb-view-wide">
      <PageHeader title="Мои обращения" subtitle="Обращения, которые вы отправили." />
      <TicketList
        tickets={mine}
        variant="comfortable"
        onOpen={onOpenTicket}
        onToggleLike={onToggleLike}
        emptyMessage="Вы ещё не отправляли обращений."
      />
    </div>
  )
}
