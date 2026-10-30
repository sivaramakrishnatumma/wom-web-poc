import { useTranslation } from 'react-i18next'
import { LANGUAGES } from '../../languages.ts'
import { Icon, LogoMark, type IconName } from '../icons.tsx'
import './ChatHeader.css'

type Props = {
  online: boolean
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  canClear: boolean
  onClear: () => void
  technicianLanguage: string
  onTechnicianLanguageChange: (code: string) => void
  customerLanguage: string
  onCustomerLanguageChange: (code: string) => void
}

function ChatHeader({
  online,
  theme,
  onToggleTheme,
  canClear,
  onClear,
  technicianLanguage,
  onTechnicianLanguageChange,
  customerLanguage,
  onCustomerLanguageChange,
}: Props) {
  const { t } = useTranslation()

  return (
    <header className="chat-header">
      <div className="chat-title">
        <span className="chat-logo">
          <LogoMark size={30} />
        </span>
        <div className="chat-heading">
          <h1>{t('appTitle')}</h1>
          <span className={online ? 'status' : 'status offline'}>
            <span className="status-dot" aria-hidden="true" />
            {online ? t('online') : t('offline')}
          </span>
        </div>
        <div className="header-actions">
          {/* Shows the theme it switches to */}
          <button
            type="button"
            className="icon-button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? t('lightMode') : t('darkMode')}
            title={theme === 'dark' ? t('lightMode') : t('darkMode')}
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
          </button>
          {canClear && (
            <button
              type="button"
              className="icon-button"
              onClick={onClear}
              aria-label={t('clearChat')}
              title={t('clearChat')}
            >
              <Icon name="trash" />
            </button>
          )}
        </div>
      </div>

      <div className="lang-bar">
        <LanguageField
          icon="wrench"
          label={t('myLanguage')}
          value={technicianLanguage}
          onChange={onTechnicianLanguageChange}
        />
        <span className="lang-swap" aria-hidden="true">
          <Icon name="swap" size={18} />
        </span>
        <LanguageField
          icon="person"
          label={t('customerLanguage')}
          value={customerLanguage}
          onChange={onCustomerLanguageChange}
        />
      </div>
    </header>
  )
}

type LanguageFieldProps = {
  icon: IconName
  label: string
  value: string
  onChange: (code: string) => void
}

function LanguageField({ icon, label, value, onChange }: LanguageFieldProps) {
  return (
    <label className="lang-field">
      <span className="lang-label">
        <Icon name={icon} size={14} />
        {label}
      </span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.native}
          </option>
        ))}
      </select>
    </label>
  )
}

export default ChatHeader
