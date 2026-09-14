import type { NewFeedbackInput } from '../types'
import { FeedbackForm } from './FeedbackForm'
import { PageHeader } from './PageHeader'
import './ViewLayout.css'

type CreateFeedbackViewProps = {
  onSubmit: (input: NewFeedbackInput) => void
}

export function CreateFeedbackView({ onSubmit }: CreateFeedbackViewProps) {
  return (
    <div className="fb-view">
      <PageHeader
        title="Новое обращение"
        subtitle="Заполните форму ниже — мы свяжемся с вами прямо в этом обращении."
      />

      <FeedbackForm onSubmit={onSubmit} />
    </div>
  )
}
