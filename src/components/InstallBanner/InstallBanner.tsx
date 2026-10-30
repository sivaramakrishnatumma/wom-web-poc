import { useTranslation } from 'react-i18next'
import { useInstallPrompt } from '../../hooks/useInstallPrompt.ts'
import { Icon, LogoMark } from '../icons.tsx'
import './InstallBanner.css'

// Offers to install the PWA so users don't have to find it in the browser menu
function InstallBanner() {
  const { t } = useTranslation()
  const { mode, install, dismiss } = useInstallPrompt()

  if (!mode) return null

  return (
    <div className="install-banner" role="region" aria-label={t('installTitle')}>
      <span className="install-logo" aria-hidden="true">
        <LogoMark size={28} />
      </span>
      <div className="install-text">
        <strong>{t('installTitle')}</strong>
        {mode === 'prompt' ? (
          <span>{t('installHint')}</span>
        ) : (
          <span className="install-ios">
            <Icon name="share" size={16} />
            {t('iosInstall')}
          </span>
        )}
      </div>
      <div className="install-actions">
        {mode === 'prompt' && (
          <button type="button" className="install-button" onClick={() => void install()}>
            <Icon name="download" size={18} />
            {t('install')}
          </button>
        )}
        <button type="button" className="install-later" onClick={dismiss}>
          {t('notNow')}
        </button>
      </div>
    </div>
  )
}

export default InstallBanner
