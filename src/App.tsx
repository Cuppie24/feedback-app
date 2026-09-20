import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/useAuth'
import { FeedbackApp } from './features/feedback/components/FeedbackApp'
import { LoadingScreen } from './shared/LoadingScreen'
import { LoginPage } from './pages/LoginPage'

function App() {
  const { status } = useAuth()

  if (status === 'loading') {
    return <LoadingScreen />
  }

  return (
    <Routes>
      <Route path="/login" element={status === 'authenticated' ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/*" element={status === 'authenticated' ? <FeedbackApp /> : <Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
