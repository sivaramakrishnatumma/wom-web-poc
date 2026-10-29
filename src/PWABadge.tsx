import { useTranslation } from 'react-i18next'
import { useRegisterSW } from 'virtual:pwa-register/react'
import './PWABadge.css'

function PWABadge() {
  const { t } = useTranslation()
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(error) {
      console.error('Service worker registration error', error)
    },
  })

  function close() {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  if (!offlineReady && !needRefresh) return null

  return (
    <div className="pwa-toast" role="alert" aria-labelledby="pwa-toast-message">
      <span id="pwa-toast-message">
        {offlineReady ? t('offlineReady') : t('newVersion')}
      </span>
      <div className="pwa-toast-buttons">
        {needRefresh && (
          <button type="button" onClick={() => updateServiceWorker(true)}>
            {t('reload')}
          </button>
        )}
        <button type="button" onClick={close}>
          {t('close')}
        </button>
      </div>
    </div>
  )
}

export default PWABadge
