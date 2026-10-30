import { useTranslation } from 'react-i18next'
import { nativeName } from '../../languages.ts'
import { Icon } from '../icons.tsx'
import './EmptyState.css'

type Props = { technicianLanguage: string; customerLanguage: string }

function EmptyState({ technicianLanguage, customerLanguage }: Props) {
  const { t } = useTranslation()

  return (
    <div className="empty">
      <div className="empty-mic" aria-hidden="true">
        <Icon name="mic" size={40} />
      </div>
      <p className="empty-title">{t('emptyTitle')}</p>
      <p className="empty-hint">{t('emptyHint')}</p>
      <div className="empty-langs" aria-hidden="true">
        <span className="chip">{nativeName(technicianLanguage)}</span>
        <Icon name="swap" size={16} />
        <span className="chip">{nativeName(customerLanguage)}</span>
      </div>
    </div>
  )
}

export default EmptyState
