import { PlaceholderView } from './PlaceholderView'

// Placeholder for the user-mode "Популярное" tab - see UserTabBar.tsx and
// FeedbackApp.tsx. Intentionally empty until popularity ranking ships.
export function PopularTicketsView() {
  return (
    <PlaceholderView subtitle="Раздел в разработке — скоро здесь появятся самые обсуждаемые обращения." />
  )
}
