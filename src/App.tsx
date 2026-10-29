import { useEffect, useRef, useState, type KeyboardEvent, type SubmitEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { translate, transcribe } from './api.ts'
import './App.css'
import { findLanguage, LANGUAGES } from './languages.ts'
import PWABadge from './PWABadge.tsx'
import { useRecorder, type RecorderError } from './useRecorder.ts'

type Speaker = 'technician' | 'customer'

type Message = {
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

type Notice = { key: RecorderError | 'noSpeech' | 'wrongLanguage'; language?: string }

const STORAGE_KEY = 'wom-chat'
const MAX_CHARS = 1000
const MAX_RECORDING_SECONDS = 120

type Saved = { messages: Message[]; customerLanguage: string }

function load(): Saved {
  const fallback: Saved = { messages: [], customerLanguage: 'en' }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return fallback
    const saved = JSON.parse(raw) as Saved
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

function useOnline() {
  const [online, setOnline] = useState(navigator.onLine)
  useEffect(() => {
    const update = () => setOnline(navigator.onLine)
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [])
  return online
}

function formatTime(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

function nativeName(code: string) {
  return findLanguage(code)?.native ?? code
}

function App() {
  const { t, i18n } = useTranslation()
  const [initial] = useState(load)
  const [messages, setMessages] = useState<Message[]>(initial.messages)
  const [customerLanguage, setCustomerLanguage] = useState(initial.customerLanguage)
  const [speaker, setSpeaker] = useState<Speaker>('technician')
  const [input, setInput] = useState('')
  const [notice, setNotice] = useState<Notice | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const online = useOnline()
  const recorder = useRecorder()
  const audioRef = useRef(new Map<string, Blob>())
  const stoppingRef = useRef(false)
  const listRef = useRef<HTMLDivElement>(null)

  // The technician's language is also the app's UI language
  const technicianLanguage = i18n.resolvedLanguage ?? 'en'
  // Customer-facing labels are shown in the customer's own language
  const tc = i18n.getFixedT(customerLanguage)

  const languageOf = (who: Speaker) => (who === 'technician' ? technicianLanguage : customerLanguage)
  const otherLanguage = (who: Speaker) => (who === 'technician' ? customerLanguage : technicianLanguage)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages, customerLanguage }))
    } catch {
      // Storage unavailable (private mode etc.) — history just won't persist
    }
  }, [messages, customerLanguage])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(null), 8000)
    return () => clearTimeout(timer)
  }, [notice])

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
          setNotice({ key: 'noSpeech' })
          return
        }
        // Keep the message, but flag that it didn't come back in the expected
        // language — usually the wrong speaker or language is selected
        if (result.languageMismatch) {
          setNotice({ key: 'wrongLanguage', language: nativeName(message.from) })
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

  function newMessage(who: Speaker, original = ''): Message {
    return {
      id: crypto.randomUUID(),
      speaker: who,
      from: languageOf(who),
      to: otherLanguage(who),
      original,
      translation: '',
      status: original ? 'translating' : 'transcribing',
    }
  }

  function sendText(e?: SubmitEvent) {
    e?.preventDefault()
    const text = input.trim()
    if (!text || !online) return
    const message = newMessage(speaker, text)
    setMessages((prev) => [...prev, message])
    setInput('')
    void process(message)
  }

  async function startRecording() {
    setNotice(null)
    const error = await recorder.start()
    if (error) setNotice({ key: error })
  }

  async function stopRecording() {
    // The stop button and the time-limit auto-stop can both fire
    if (stoppingRef.current) return
    stoppingRef.current = true
    const audio = await recorder.stop()
    stoppingRef.current = false
    if (!audio) {
      setNotice({ key: 'noSpeech' })
      return
    }
    const message = newMessage(speaker)
    audioRef.current.set(message.id, audio)
    setMessages((prev) => [...prev, message])
    void process(message, audio)
  }

  useEffect(() => {
    if (recorder.recording && recorder.elapsed >= MAX_RECORDING_SECONDS) void stopRecording()
    // stopRecording is recreated each render; only the elapsed time matters here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recorder.recording, recorder.elapsed])

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

  function canRetry(m: Message) {
    return Boolean(m.original) || audioRef.current.has(m.id)
  }

  function retry(m: Message) {
    void process(m, m.original ? undefined : audioRef.current.get(m.id))
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      sendText()
    }
  }

  async function copy(m: Message) {
    try {
      await navigator.clipboard.writeText(m.translation)
      setCopiedId(m.id)
      setTimeout(() => setCopiedId((id) => (id === m.id ? null : id)), 1500)
    } catch {
      // Clipboard blocked; nothing useful to do
    }
  }

  function speak(m: Message) {
    if (!('speechSynthesis' in window)) return
    speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(m.translation)
    utterance.lang = findLanguage(m.to)?.locale ?? m.to
    speechSynthesis.speak(utterance)
  }

  function clearChat() {
    setMessages([])
    audioRef.current.clear()
  }

  const speakerLabel = (who: Speaker) =>
    who === 'technician' ? t('technician') : tc('customer')

  return (
    <div className="chat">
      <header className="chat-header">
        <div className="chat-title">
          <span className="chat-avatar" aria-hidden="true">
            文A
          </span>
          <div>
            <h1>{t('appTitle')}</h1>
            <p className={online ? 'status' : 'status offline'}>
              {online ? t('online') : t('offline')}
            </p>
          </div>
          {messages.length > 0 && (
            <button type="button" className="ghost" onClick={clearChat}>
              {t('clearChat')}
            </button>
          )}
        </div>

        <div className="lang-bar">
          <label>
            <span>{t('myLanguage')}</span>
            <select
              value={technicianLanguage}
              onChange={(e) => void i18n.changeLanguage(e.target.value)}
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.native}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>{t('customerLanguage')}</span>
            <select value={customerLanguage} onChange={(e) => setCustomerLanguage(e.target.value)}>
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.native}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      <div className="messages" ref={listRef} aria-live="polite">
        {messages.length === 0 && (
          <div className="empty">
            <p>{t('emptyTitle')}</p>
            <p className="hint">{t('emptyHint')}</p>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={`row ${m.speaker}`}>
            <div className="who">
              {speakerLabel(m.speaker)} · {nativeName(m.from)}
            </div>
            <div className={`bubble ${m.status}`}>
              <p className="original" lang={m.from} dir="auto">
                {m.original || <Pending label={t('transcribing')} />}
              </p>
              {m.original && m.from !== m.to && (
                <p className="translation" lang={m.to} dir="auto">
                  {m.status === 'translating' ? (
                    <Pending label={t('translating')} />
                  ) : (
                    m.translation
                  )}
                </p>
              )}
              {m.extra && (
                <p className="translation extra" lang={m.extra.lang} dir="auto">
                  <span className="tag">{nativeName(m.extra.lang)}</span>
                  {m.extra.status === 'translating' && <Pending label={t('translating')} />}
                  {m.extra.status === 'done' && m.extra.text}
                  {m.extra.status === 'error' && t('failed')}
                </p>
              )}
            </div>
            {m.status === 'done' && (
              <div className="meta">
                <button type="button" onClick={() => speak(m)}>
                  {t('listen')}
                </button>
                <button type="button" onClick={() => copy(m)}>
                  {copiedId === m.id ? t('copied') : t('copy')}
                </button>
                <select
                  className="translate-select"
                  value={m.extra?.lang ?? ''}
                  onChange={(e) => void translateTo(m, e.target.value)}
                  disabled={!online}
                  aria-label={t('translateTo')}
                >
                  <option value="" disabled>
                    {t('translateTo')}
                  </option>
                  {LANGUAGES.filter((l) => l.code !== m.from).map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.native}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {m.status === 'error' && (
              <div className="meta error">
                <span title={m.error}>{t('failed')}</span>
                {canRetry(m) && (
                  <button type="button" onClick={() => retry(m)} disabled={!online}>
                    {t('retry')}
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {notice && (
        <div className="notice" role="alert">
          <span>{t(notice.key, { language: notice.language })}</span>
          <button type="button" onClick={() => setNotice(null)} aria-label={t('close')}>
            ✕
          </button>
        </div>
      )}

      <footer className="composer">
        <div className="speakers" role="radiogroup" aria-label={t('whoIsSpeaking')}>
          {(['technician', 'customer'] as const).map((who) => (
            <button
              key={who}
              type="button"
              role="radio"
              aria-checked={speaker === who}
              className={speaker === who ? 'active' : ''}
              onClick={() => setSpeaker(who)}
              disabled={recorder.recording}
            >
              <strong>{speakerLabel(who)}</strong>
              <span>{nativeName(languageOf(who))}</span>
            </button>
          ))}
        </div>

        {recorder.recording ? (
          <div className="recording">
            <span className="rec-dot" aria-hidden="true" />
            <span className="rec-time">
              {(speaker === 'technician' ? t : tc)('listening', {
                time: formatTime(recorder.elapsed),
              })}
            </span>
            <button type="button" className="ghost" onClick={recorder.cancel}>
              {t('cancel')}
            </button>
            <button
              type="button"
              className="round stop"
              onClick={() => void stopRecording()}
              aria-label={t('stopAndSend')}
              title={t('stopAndSend')}
            >
              ■
            </button>
          </div>
        ) : (
          <form className="input-row" onSubmit={sendText}>
            <textarea
              rows={1}
              value={input}
              maxLength={MAX_CHARS}
              placeholder={online ? t('typeMessage') : t('youAreOffline')}
              disabled={!online}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              aria-label={t('typeMessage')}
              lang={languageOf(speaker)}
              dir="auto"
            />
            {input.trim() ? (
              <button type="submit" className="round" aria-label={t('send')} title={t('send')}>
                ➤
              </button>
            ) : (
              <button
                type="button"
                className="round mic"
                onClick={() => void startRecording()}
                disabled={!online}
                aria-label={(speaker === 'technician' ? t : tc)('tapToSpeak')}
                title={(speaker === 'technician' ? t : tc)('tapToSpeak')}
              >
                <MicIcon />
              </button>
            )}
          </form>
        )}
      </footer>

      <PWABadge />
    </div>
  )
}

function Pending({ label }: { label: string }) {
  return (
    <span className="pending">
      <span className="typing" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      {label}
    </span>
  )
}

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V22h2v-3.08A7 7 0 0 0 19 12h-2Z"
      />
    </svg>
  )
}

export default App
