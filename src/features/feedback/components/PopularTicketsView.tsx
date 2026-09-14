import { PageHeader } from './PageHeader'
import './ViewLayout.css'

// Placeholder for the user-mode "Популярное" tab - see UserTabBar.tsx and
// FeedbackApp.tsx. Intentionally empty until popularity ranking ships.
export function PopularTicketsView() {
  return (
    <div className="fb-view">
      <PageHeader title="Популярное" subtitle="Раздел в разработке — скоро здесь появятся самые обсуждаемые обращения." />
    </div>
  )
}
