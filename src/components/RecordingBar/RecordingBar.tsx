import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import { Icon } from '../icons.tsx'
import './RecordingBar.css'

type Props = {
  elapsed: number
  // Translates the "Listening…" label into the current speaker's language
  speakerT: TFunction
  onCancel: () => void
  onStop: () => void
}

function formatTime(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

function RecordingBar({ elapsed, speakerT, onCancel, onStop }: Props) {
  const { t } = useTranslation()

  return (
    <div className="recording">
      <span className="wave" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
      </span>
      <span className="rec-time">{speakerT('listening', { time: formatTime(elapsed) })}</span>
      <button type="button" className="pill" onClick={onCancel}>
        {t('cancel')}
      </button>
      <button
        type="button"
        className="round stop"
        onClick={onStop}
        aria-label={t('stopAndSend')}
        title={t('stopAndSend')}
      >
        <Icon name="stop" size={24} />
      </button>
    </div>
  )
}

export default RecordingBar
