import { useCallback, useEffect, useState } from 'react'

// Theme preference: 'system' follows prefers-color-scheme (no data-theme
// attribute); 'light' / 'dark' force the palette via <html data-theme>.
// The tokens live in src/styles/tokens.css.

export type ThemePreference = 'system' | 'light' | 'dark'

const STORAGE_KEY = 'feedback-app-theme'
const CYCLE: ThemePreference[] = ['system', 'light', 'dark']

function readStored(): ThemePreference {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    if (value === 'light' || value === 'dark' || value === 'system') return value
  } catch {
    // localStorage can be unavailable (private mode, blocked cookies).
  }
  return 'system'
}

function applyPreference(preference: ThemePreference) {
  const root = document.documentElement
  if (preference === 'system') {
    root.removeAttribute('data-theme')
  } else {
    root.setAttribute('data-theme', preference)
  }
}

export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>(readStored)

  // Sync the choice out to the DOM and localStorage (both external).
  useEffect(() => {
    applyPreference(preference)
    try {
      localStorage.setItem(STORAGE_KEY, preference)
    } catch {
      // Persisting is best-effort.
    }
  }, [preference])

  const cycleTheme = useCallback(() => {
    setPreference((current) => CYCLE[(CYCLE.indexOf(current) + 1) % CYCLE.length])
  }, [])

  return { preference, setPreference, cycleTheme }
}
