import type { RecorderError } from './hooks/useRecorder.ts'

export type Speaker = 'technician' | 'customer'

export type Message = {
  id: string
  speaker: Speaker
  from: string
  to: string
  original: string
  translation: string
  status: 'transcribing' | 'translating' | 'done' | 'error'
  error?: string
  // Extra on-demand translation picked from the message's "Translate to" menu
  extra?: { lang: string; text: string; status: 'translating' | 'done' | 'error' }
}

export type Notice = { key: RecorderError | 'noSpeech' | 'wrongLanguage'; language?: string }
