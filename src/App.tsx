import { useAuth } from './context/useAuth'
import { FeedbackApp } from './features/feedback/components/FeedbackApp'
import { LoadingScreen } from './shared/LoadingScreen'
import { LoginPage } from './pages/LoginPage'

function App() {
  const { status } = useAuth()

  if (status === 'loading') {
    return <LoadingScreen />
  }

  if (status === 'unauthenticated') {
    return <LoginPage />
  }

  return <FeedbackApp />
}

export default App
