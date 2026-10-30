import { useTranslation } from 'react-i18next'
import { nativeName } from '../../languages.ts'
import type { Message, Speaker } from '../../types.ts'
import { Icon } from '../icons.tsx'
import MessageActions from '../MessageActions/MessageActions.tsx'
import Pending from '../Pending/Pending.tsx'
import './MessageItem.css'

type Props = {
  message: Message
  online: boolean
  speakerLabel: (who: Speaker) => string
  canRetry: (m: Message) => boolean
  onRetry: (m: Message) => void
  onTranslate: (m: Message, lang: string) => void
}

function MessageItem({ message: m, speakerLabel, ...actionProps }: Props) {
  const { t } = useTranslation()

  return (
    <div className={`row ${m.speaker}`}>
      <div className="who">
        <span className="who-avatar" aria-hidden="true">
          <Icon name={m.speaker === 'technician' ? 'wrench' : 'person'} size={13} />
        </span>
        {speakerLabel(m.speaker)} · {nativeName(m.from)}
      </div>

      <div className={`bubble ${m.status}`}>
        <p className="original" lang={m.from} dir="auto">
          {m.original || <Pending label={t('transcribing')} />}
        </p>
        {m.original && m.from !== m.to && (
          <p className="translation" lang={m.to} dir="auto">
            <span className="tag">{nativeName(m.to)}</span>
            {m.status === 'translating' ? <Pending label={t('translating')} /> : m.translation}
          </p>
        )}
        {m.extra && (
          <p className="translation" lang={m.extra.lang} dir="auto">
            <span className="tag">{nativeName(m.extra.lang)}</span>
            {m.extra.status === 'translating' && <Pending label={t('translating')} />}
            {m.extra.status === 'done' && m.extra.text}
            {m.extra.status === 'error' && t('failed')}
          </p>
        )}
      </div>

      <MessageActions message={m} {...actionProps} />
    </div>
  )
}

export default MessageItem
