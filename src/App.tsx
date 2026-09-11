import { useAuth } from './context/useAuth'
import { FeedbackApp } from './features/feedback/components/FeedbackApp'
import { LoadingScreen } from './shared/LoadingScreen'
import { LoginPage } from './pages/LoginPage'

function App() {
  const { status } = useAuth()
  void status
  void LoadingScreen
  void LoginPage

  return <FeedbackApp />
}

export default App
