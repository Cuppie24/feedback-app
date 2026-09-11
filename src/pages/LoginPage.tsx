import { useState, type FormEvent } from 'react'
import { Monitor, Moon, Sun } from 'lucide-react'
import { ApiError } from '../api/client'
import { useAuth } from '../context/useAuth'
import { useTheme } from '../shared/useTheme'
import './LoginPage.css'

type FieldErrors = {
  username?: string
  password?: string
}

const THEME_META = {
  system: { label: 'Системная тема', Icon: Monitor },
  light: { label: 'Светлая тема', Icon: Sun },
  dark: { label: 'Тёмная тема', Icon: Moon },
} as const

export function LoginPage() {
  const { login } = useAuth()
  const { preference, cycleTheme } = useTheme()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const nextErrors: FieldErrors = {}
    if (!username.trim()) nextErrors.username = 'Введите логин'
    if (!password) nextErrors.password = 'Введите пароль'
    setFieldErrors(nextErrors)
    if (nextErrors.username || nextErrors.password) return

    setIsSubmitting(true)

    try {
      await login({ username, password })
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError('Неверный логин или пароль')
      } else {
        setError('Что-то пошло не так. Попробуйте ещё раз.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const clearFieldError = (field: keyof FieldErrors) => {
    setFieldErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))
  }

  const describedBy = (field: keyof FieldErrors) => {
    const ids: string[] = []
    if (fieldErrors[field]) ids.push(`${field}-error`)
    if (error) ids.push('login-error')
    return ids.length > 0 ? ids.join(' ') : undefined
  }

  const isInvalid = (field: keyof FieldErrors) =>
    fieldErrors[field] || error ? true : undefined

  const { label: themeLabel, Icon: ThemeIcon } = THEME_META[preference]

  return (
    <section className="login-page">
      <button
        type="button"
        className="login-theme-toggle"
        onClick={cycleTheme}
        aria-label={`${themeLabel}. Нажмите, чтобы сменить`}
        title={themeLabel}
      >
        <ThemeIcon size={16} aria-hidden="true" />
      </button>

      <div className="login-card">
        <aside className="login-rail">
          <div className="login-brand">
            <span className="login-brand-mark" aria-hidden="true" />
            <span className="login-brand-name">Micros</span>
          </div>
          <div className="login-rail-lines" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <p className="login-rail-note">рабочее пространство</p>
        </aside>

        <div className="login-panel">
          <p className="login-overline">Вход</p>
          <h1 className="login-title">Техническая поддержка</h1>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="login-field">
              <label className="login-sr-only" htmlFor="username">
                Электронная почта
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder="Электронная почта"
                value={username}
                onChange={(event) => {
                  setUsername(event.target.value)
                  clearFieldError('username')
                }}
                aria-invalid={isInvalid('username')}
                aria-describedby={describedBy('username')}
                required
              />
              {fieldErrors.username && (
                <p className="login-field-error" id="username-error" role="alert">
                  {fieldErrors.username}
                </p>
              )}
            </div>

            <div className="login-field">
              <label className="login-sr-only" htmlFor="password">
                Пароль
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Пароль"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  clearFieldError('password')
                }}
                aria-invalid={isInvalid('password')}
                aria-describedby={describedBy('password')}
                required
              />
              {fieldErrors.password && (
                <p className="login-field-error" id="password-error" role="alert">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {error && (
              <p className="login-error" id="login-error" role="alert">
                {error}
              </p>
            )}

            <button className="login-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Вход...' : 'Войти'}
            </button>
          </form>

          <p className="login-help">
            Не можете войти? Свяжитесь с администратором
          </p>
        </div>
      </div>
    </section>
  )
}
