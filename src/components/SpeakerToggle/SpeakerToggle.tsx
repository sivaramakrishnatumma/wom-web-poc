import { useTranslation } from 'react-i18next'
import { nativeName } from '../../languages.ts'
import type { Speaker } from '../../types.ts'
import { Icon } from '../icons.tsx'
import './SpeakerToggle.css'

type Props = {
  speaker: Speaker
  onChange: (who: Speaker) => void
  disabled: boolean
  languages: Record<Speaker, string>
  speakerLabel: (who: Speaker) => string
}

const SPEAKERS: Speaker[] = ['technician', 'customer']

// Chooses whose turn it is: the mic and text box post as this speaker
function SpeakerToggle({ speaker, onChange, disabled, languages, speakerLabel }: Props) {
  const { t } = useTranslation()

  return (
    <div className="speakers" role="radiogroup" aria-label={t('whoIsSpeaking')}>
      {SPEAKERS.map((who) => (
        <button
          key={who}
          type="button"
          role="radio"
          aria-checked={speaker === who}
          className={speaker === who ? 'active' : ''}
          onClick={() => onChange(who)}
          disabled={disabled}
        >
          <Icon name={who === 'technician' ? 'wrench' : 'person'} size={18} />
          <span className="speaker-text">
            <strong>{speakerLabel(who)}</strong>
            <span>{nativeName(languages[who])}</span>
          </span>
        </button>
      ))}
    </div>
  )
}

export default SpeakerToggle
