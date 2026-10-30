import { useRef, useState } from 'react'
import { translate, transcribe } from '../api.ts'
import { nativeName } from '../languages.ts'
import type { Message, Notice, Speaker } from '../types.ts'

type Options = {
  initialMessages: Message[]
  // Current language of each side of the conversation
  languages: Record<Speaker, string>
  onNotice: (notice: Notice) => void
}

// Owns the conversation: adds messages, runs transcription and translation,
// and handles retries and on-demand extra translations.
export function useChat({ initialMessages, languages, onNotice }: Options) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  // Recorded audio kept until transcription succeeds, so a failure can be retried
  const audioRef = useRef(new Map<string, Blob>())

  function update(id: string, changes: Partial<Message>) {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...changes } : m)))
  }

  // Runs transcription (when given audio) and translation for one message
  async function process(message: Message, audio?: Blob) {
    let original = message.original
    try {
      if (audio) {
        update(message.id, { status: 'transcribing', error: undefined })
        const result = await transcribe(audio, message.from)
        original = result.text
        if (!original) {
          setMessages((prev) => prev.filter((m) => m.id !== message.id))
          audioRef.current.delete(message.id)
          onNotice({ key: 'noSpeech' })
          return
        }
        // Keep the message, but flag that it didn't come back in the expected
        // language — usually the wrong speaker or language is selected
        if (result.languageMismatch) {
          onNotice({ key: 'wrongLanguage', language: nativeName(message.from) })
        }
        audioRef.current.delete(message.id)
      }
      update(message.id, { original, status: 'translating', error: undefined })
      const translation = await translate(original, message.from, message.to)
      update(message.id, { translation, status: 'done' })
    } catch (err) {
      update(message.id, {
        original,
        status: 'error',
        error: err instanceof Error ? err.message : undefined,
      })
    }
  }

  function newMessage(speaker: Speaker, original = ''): Message {
    const other: Speaker = speaker === 'technician' ? 'customer' : 'technician'
    return {
      id: crypto.randomUUID(),
      speaker,
      from: languages[speaker],
      to: languages[other],
      original,
      translation: '',
      status: original ? 'translating' : 'transcribing',
    }
  }

  function sendText(speaker: Speaker, text: string) {
    const message = newMessage(speaker, text)
    setMessages((prev) => [...prev, message])
    void process(message)
  }

  function sendAudio(speaker: Speaker, audio: Blob) {
    const message = newMessage(speaker)
    audioRef.current.set(message.id, audio)
    setMessages((prev) => [...prev, message])
    void process(message, audio)
  }

  function canRetry(m: Message) {
    return Boolean(m.original) || audioRef.current.has(m.id)
  }

  function retry(m: Message) {
    void process(m, m.original ? undefined : audioRef.current.get(m.id))
  }

  async function translateTo(m: Message, lang: string) {
    // Already have this one from the main translation; no need to call the API
    if (lang === m.to) {
      update(m.id, { extra: { lang, text: m.translation, status: 'done' } })
      return
    }
    update(m.id, { extra: { lang, text: '', status: 'translating' } })
    try {
      const text = await translate(m.original, m.from, lang)
      setMessages((prev) =>
        prev.map((x) =>
          // Ignore the result if another language was picked in the meantime
          x.id === m.id && x.extra?.lang === lang ? { ...x, extra: { lang, text, status: 'done' } } : x,
        ),
      )
    } catch {
      setMessages((prev) =>
        prev.map((x) =>
          x.id === m.id && x.extra?.lang === lang
            ? { ...x, extra: { lang, text: '', status: 'error' } }
            : x,
        ),
      )
    }
  }

  function clear() {
    setMessages([])
    audioRef.current.clear()
  }

  return { messages, sendText, sendAudio, canRetry, retry, translateTo, clear }
}
