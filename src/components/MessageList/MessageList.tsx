import { useEffect, useRef } from 'react'
import type { Message, Speaker } from '../../types.ts'
import EmptyState from '../EmptyState/EmptyState.tsx'
import MessageItem from '../MessageItem/MessageItem.tsx'
import './MessageList.css'

type Props = {
  messages: Message[]
  online: boolean
  languages: Record<Speaker, string>
  speakerLabel: (who: Speaker) => string
  canRetry: (m: Message) => boolean
  onRetry: (m: Message) => void
  onTranslate: (m: Message, lang: string) => void
}

function MessageList({ messages, languages, ...itemProps }: Props) {
  const listRef = useRef<HTMLDivElement>(null)

  // Keep the newest message in view
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  return (
    <div className="messages" ref={listRef} aria-live="polite">
      {messages.length === 0 && (
        <EmptyState
          technicianLanguage={languages.technician}
          customerLanguage={languages.customer}
        />
      )}
      {messages.map((m) => (
        <MessageItem key={m.id} message={m} {...itemProps} />
      ))}
    </div>
  )
}

export default MessageList
