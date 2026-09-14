import { PlaceholderView } from './PlaceholderView'

// Placeholder for the agent-mode "Системы" sidebar item - see
// Sidebar.tsx and FeedbackApp.tsx. Intentionally empty for now.
export function SystemsView() {
  return (
    <PlaceholderView
      title="Системы"
      subtitle="Раздел в разработке — здесь появится управление подключёнными системами."
    />
  )
}
