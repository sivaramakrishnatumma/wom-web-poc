import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { findLanguage, LANGUAGES } from '../../languages.ts'
import type { Message } from '../../types.ts'
import { Icon } from '../icons.tsx'
import './MessageActions.css'

type Props = {
  message: Message
  online: boolean
  canRetry: (m: Message) => boolean
  onRetry: (m: Message) => void
  onTranslate: (m: Message, lang: string) => void
}

// Buttons under a message: Listen / Copy / Translate when done, Retry on error
function MessageActions({ message: m, online, canRetry, onRetry, onTranslate }: Props) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(m.translation)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard blocked; nothing useful to do
    }
  }

  function speak() {
    if (!('speechSynthesis' in window)) return
    speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(m.translation)
    utterance.lang = findLanguage(m.to)?.locale ?? m.to
    speechSynthesis.speak(utterance)
  }

  if (m.status === 'error') {
    return (
      <div className="meta error">
        <span className="error-text" title={m.error}>
          <Icon name="warning" size={15} />
          {t('failed')}
        </span>
        {canRetry(m) && (
          <button type="button" className="pill" onClick={() => onRetry(m)} disabled={!online}>
            <Icon name="refresh" size={15} />
            {t('retry')}
          </button>
        )}
      </div>
    )
  }

  if (m.status !== 'done') return null

  return (
    <div className="meta">
      <button type="button" className="pill" onClick={speak}>
        <Icon name="speaker" size={15} />
        {t('listen')}
      </button>
      <button type="button" className="pill" onClick={() => void copy()}>
        <Icon name={copied ? 'check' : 'copy'} size={15} />
        {copied ? t('copied') : t('copy')}
      </button>
      <label className="pill translate-pill">
        <Icon name="translate" size={15} />
        <select
          value={m.extra?.lang ?? ''}
          onChange={(e) => onTranslate(m, e.target.value)}
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
      </label>
    </div>
  )
}

export default MessageActions
