import { useTranslation } from 'react-i18next'
import type { Speaker } from '../types.ts'

// Technician-facing text uses the app (technician) language; customer-facing
// text such as the customer's own mic button uses the customer's language.
export function useSpeakerText(customerLanguage: string) {
  const { t, i18n } = useTranslation()
  const tc = i18n.getFixedT(customerLanguage)

  const tFor = (who: Speaker) => (who === 'technician' ? t : tc)
  const speakerLabel = (who: Speaker) => tFor(who)(who)

  return { tFor, speakerLabel }
}
