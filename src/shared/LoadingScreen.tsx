import './LoadingScreen.css'

// Full-screen state shown while the initial auth check runs. Purely
// token-based, so it follows the active theme (prefers-color-scheme plus
// the data-theme override from the theme switcher). The pre-paint script
// in index.html sets data-theme before React mounts, so the very first
// frame is already themed.
export function LoadingScreen() {
  return (
    <section className="loading-screen" aria-busy="true">
      <span className="loading-mark" aria-hidden="true" />
      <p className="loading-text" role="status">
        Загрузка…
      </p>
    </section>
  )
}
