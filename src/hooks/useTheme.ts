import { useState } from 'react'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'wom-theme'
// Browser/OS bar colour for each theme (matches the header background)
const BAR_COLOR: Record<Theme, string> = { light: '#ffffff', dark: '#071a30' }

// Light by default; the choice is saved and applied before first paint by the
// inline script in index.html.
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light',
  )

  function toggleTheme() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    const root = document.documentElement
    if (next === 'dark') root.dataset.theme = 'dark'
    else delete root.dataset.theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', BAR_COLOR[next])
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Not persisted; the theme still applies for this visit
    }
    setTheme(next)
  }

  return { theme, toggleTheme }
}
