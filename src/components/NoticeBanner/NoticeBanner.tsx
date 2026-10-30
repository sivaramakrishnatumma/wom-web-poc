import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { Notice } from '../../types.ts'
import { Icon } from '../icons.tsx'
import './NoticeBanner.css'

const AUTO_DISMISS_MS = 8000

type Props = { notice: Notice; onClose: () => void }

function NoticeBanner({ notice, onClose }: Props) {
  const { t } = useTranslation()

  useEffect(() => {
    const timer = setTimeout(onClose, AUTO_DISMISS_MS)
    return () => clearTimeout(timer)
    // Restart the timer only when a new notice arrives
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notice])

  return (
    <div className="notice" role="alert">
      <Icon name="warning" size={18} />
      <span>{t(notice.key, { language: notice.language })}</span>
      <button type="button" onClick={onClose} aria-label={t('close')}>
        <Icon name="close" size={18} />
      </button>
    </div>
  )
}

export default NoticeBanner
