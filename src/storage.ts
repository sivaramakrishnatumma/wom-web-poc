import type { Message } from './types.ts'

const STORAGE_KEY = 'wom-chat'

export type SavedChat = { messages: Message[]; customerLanguage: string }

export function loadChat(): SavedChat {
  const fallback: SavedChat = { messages: [], customerLanguage: 'en' }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return fallback
    const saved = JSON.parse(raw) as SavedChat
    // Requests in flight when the page closed never finished
    const messages = saved.messages.map((m) => ({
      ...m,
      status: m.status === 'done' || m.status === 'error' ? m.status : ('error' as const),
      extra: m.extra?.status === 'translating' ? { ...m.extra, status: 'error' as const } : m.extra,
    }))
    return { ...fallback, ...saved, messages }
  } catch {
    return fallback
  }
}

export function saveChat(chat: SavedChat) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chat))
  } catch {
    // Storage unavailable (private mode etc.) — history just won't persist
  }
}
