import { Clock, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { comparePopularity } from '../data'
import type { NewFeedbackInput, Ticket } from '../types'
import { FeedbackForm } from './FeedbackForm'
import { PageHeader } from './PageHeader'
import { SegmentedControl, type SegmentedOption } from './SegmentedControl'
import { TicketList } from './TicketList'
import './ViewLayout.css'
import './CreateFeedbackView.css'

type SortMode = 'recent' | 'trending'

const SORT_OPTIONS: [SegmentedOption<SortMode>, SegmentedOption<SortMode>] = [
  { value: 'recent', label: 'Недавние', Icon: Clock },
  { value: 'trending', label: 'Популярные', Icon: TrendingUp },
]

type CreateFeedbackViewProps = {
  tickets: Ticket[]
  onSubmit: (input: NewFeedbackInput) => void
  onOpenTicket: (id: string) => void
  onToggleLike: (id: string) => void
}

export function CreateFeedbackView({ tickets, onSubmit, onOpenTicket, onToggleLike }: CreateFeedbackViewProps) {
  const [sort, setSort] = useState<SortMode>('recent')

  const sortedTickets =
    sort === 'trending' ? [...tickets].sort(comparePopularity) : [...tickets].sort((a, b) => b.createdAt - a.createdAt)

  return (
    <div className="fb-view">
      <PageHeader
        title="Новое обращение"
        subtitle="Заполните форму ниже — мы свяжемся с вами прямо в этом обращении."
      />

      <FeedbackForm onSubmit={onSubmit} />

      <div className="fb-list-section">
        <div className="fb-list-section-header">
          <h2 className="fb-section-title">Обращения</h2>
          <SegmentedControl options={SORT_OPTIONS} value={sort} onChange={setSort} />
        </div>
        <TicketList tickets={sortedTickets} onOpen={onOpenTicket} onToggleLike={onToggleLike} />
      </div>
    </div>
  )
}
