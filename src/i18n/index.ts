import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { findLanguage } from '../languages.ts'
import ar from './locales/ar.ts'
import bn from './locales/bn.ts'
import de from './locales/de.ts'
import en from './locales/en.ts'
import es from './locales/es.ts'
import fa from './locales/fa.ts'
import fr from './locales/fr.ts'
import gu from './locales/gu.ts'
import hi from './locales/hi.ts'
import ht from './locales/ht.ts'
import it from './locales/it.ts'
import ja from './locales/ja.ts'
import ko from './locales/ko.ts'
import pa from './locales/pa.ts'
import pl from './locales/pl.ts'
import pt from './locales/pt.ts'
import ru from './locales/ru.ts'
import ta from './locales/ta.ts'
import te from './locales/te.ts'
import tl from './locales/tl.ts'
import ur from './locales/ur.ts'
import vi from './locales/vi.ts'
import zh from './locales/zh.ts'

// All locales are bundled so the UI is fully translated offline (PWA).
const resources = {
  ar: { translation: ar },
  bn: { translation: bn },
  de: { translation: de },
  en: { translation: en },
  es: { translation: es },
  fa: { translation: fa },
  fr: { translation: fr },
  gu: { translation: gu },
  hi: { translation: hi },
  ht: { translation: ht },
  it: { translation: it },
  ja: { translation: ja },
  ko: { translation: ko },
  pa: { translation: pa },
  pl: { translation: pl },
  pt: { translation: pt },
  ru: { translation: ru },
  ta: { translation: ta },
  te: { translation: te },
  tl: { translation: tl },
  ur: { translation: ur },
  vi: { translation: vi },
  zh: { translation: zh },
}

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: { translation: typeof en }
  }
}

const STORAGE_KEY = 'wom-ui-language'

// Technician's language (and UI language) until they pick another one
const DEFAULT_LANGUAGE = 'te'

function initialLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && findLanguage(saved)) return saved
  } catch {
    // Storage unavailable — use the default
  }
  return DEFAULT_LANGUAGE
}

function applyToDocument(code: string) {
  document.documentElement.lang = code
  document.documentElement.dir = findLanguage(code)?.rtl ? 'rtl' : 'ltr'
}

void i18n.use(initReactI18next).init({
  resources,
  lng: initialLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false }, // React already escapes
})

applyToDocument(i18n.language)
i18n.on('languageChanged', (code) => {
  applyToDocument(code)
  try {
    localStorage.setItem(STORAGE_KEY, code)
  } catch {
    // Not persisted; the choice still applies for this session
  }
})

export default i18n
