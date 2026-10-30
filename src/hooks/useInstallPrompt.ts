import { useEffect, useState } from 'react'

// Chromium-only event (Android Chrome, Edge, Samsung Internet); not in TS's DOM types
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'wom-install-dismissed-at'
const DISMISS_DAYS = 7

// The browser can fire beforeinstallprompt before React mounts, so capture it
// at module load and let the hook subscribe to changes.
let deferredPrompt: BeforeInstallPromptEvent | null = null
const listeners = new Set<() => void>()
const notify = () => listeners.forEach((listener) => listener())

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault() // stop the browser's own mini-infobar; we show our banner
  deferredPrompt = e as BeforeInstallPromptEvent
  notify()
})
window.addEventListener('appinstalled', () => {
  deferredPrompt = null
  notify()
})

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari's non-standard flag for home-screen apps
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

// iPadOS reports itself as a Mac, so also check for a touch screen
function isIOS() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
}

function recentlyDismissed() {
  try {
    const at = Number(localStorage.getItem(DISMISS_KEY))
    return Date.now() - at < DISMISS_DAYS * 24 * 60 * 60 * 1000
  } catch {
    return false
  }
}

// 'prompt': Chromium can show its install dialog from our button
// 'ios':    iOS has no install API, so we show Share → Add to Home Screen steps
// null:     already installed, dismissed recently, or the browser can't install
export type InstallMode = 'prompt' | 'ios' | null

export function useInstallPrompt() {
  const [, rerender] = useState(0)
  const [dismissed, setDismissed] = useState(recentlyDismissed)

  useEffect(() => {
    const listener = () => rerender((n) => n + 1)
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  let mode: InstallMode = null
  if (!dismissed && !isStandalone()) {
    if (deferredPrompt) mode = 'prompt'
    else if (isIOS()) mode = 'ios'
  }

  async function install() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    // The event can only be used once; Chrome fires a new one if still installable
    deferredPrompt = null
    if (outcome === 'dismissed') dismiss()
    else notify()
  }

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()))
    } catch {
      // Not persisted; the banner stays hidden for this visit only
    }
    setDismissed(true)
  }

  return { mode, install, dismiss }
}
