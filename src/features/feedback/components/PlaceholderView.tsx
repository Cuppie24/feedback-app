import { PageHeader } from './PageHeader'
import './ViewLayout.css'

type PlaceholderViewProps = {
  title?: string
  subtitle: string
}

// Generic stub for a sidebar/tab destination that doesn't have a real
// screen yet - PageHeader only, no content. See PopularTicketsView,
// SystemsView, AgentsView.
export function PlaceholderView({ title, subtitle }: PlaceholderViewProps) {
  return (
    <div className="fb-view">
      <PageHeader title={title} subtitle={subtitle} />
    </div>
  )
}
