import { useAuth } from './context/useAuth'
import { LoadingScreen } from './shared/LoadingScreen'
import { LoginPage } from './pages/LoginPage'
import './App.css'

function App() {
  const { status, user } = useAuth()

  if (status === 'loading') {
    return <LoadingScreen />
  }

  if (status === 'unauthenticated') {
    return <LoginPage />
  }

  const username = typeof user?.username === 'string' ? user.username : undefined

  return (
    <section id="center">
      <h1>Добро пожаловать{username ? `, ${username}` : ''}</h1>
      <p>Вы вошли в систему.</p>
    </section>
  )
}

export default App
