// Shared by the app and the server. `code` is ISO-639-1 (what Azure OpenAI
// transcription expects); `locale` is the BCP-47 tag used for text-to-speech.
// `scripts` (Unicode script names) and `sample` (a sentence in that script)
// are used by the server to steer and check transcription output.
export type Language = {
  code: string
  name: string
  native: string
  locale: string
  scripts: string[]
  sample: string
  rtl?: boolean
}

// English, Telugu and the most spoken languages in US homes (Census ACS).
export const LANGUAGES: Language[] = [
  {
    code: 'en',
    name: 'English',
    native: 'English',
    locale: 'en-US',
    scripts: ['Latin'],
    sample: "Hello, I'm the technician. I'm here to repair your appliance.",
  },
  {
    code: 'te',
    name: 'Telugu',
    native: 'తెలుగు',
    locale: 'te-IN',
    scripts: ['Telugu'],
    sample: 'నమస్కారం, నేను టెక్నీషియన్‌ని. మీ పరికరాన్ని రిపేర్ చేయడానికి వచ్చాను.',
  },
  {
    code: 'hi',
    name: 'Hindi',
    native: 'हिन्दी',
    locale: 'hi-IN',
    scripts: ['Devanagari'],
    sample: 'नमस्ते, मैं तकनीशियन हूँ। मैं आपका उपकरण ठीक करने आया हूँ।',
  },
  {
    code: 'es',
    name: 'Spanish',
    native: 'Español',
    locale: 'es-US',
    scripts: ['Latin'],
    sample: 'Hola, soy el técnico. Vengo a reparar su aparato.',
  },
  {
    code: 'zh',
    name: 'Chinese (Simplified)',
    native: '中文',
    locale: 'zh-CN',
    scripts: ['Han'],
    sample: '您好，我是技术员。我来修理您的设备。',
  },
  {
    code: 'tl',
    name: 'Tagalog',
    native: 'Tagalog',
    locale: 'fil-PH',
    scripts: ['Latin'],
    sample: 'Magandang araw, ako ang technician. Nandito ako para ayusin ang inyong appliance.',
  },
  {
    code: 'vi',
    name: 'Vietnamese',
    native: 'Tiếng Việt',
    locale: 'vi-VN',
    scripts: ['Latin'],
    sample: 'Xin chào, tôi là kỹ thuật viên. Tôi đến để sửa thiết bị của bạn.',
  },
  {
    code: 'ar',
    name: 'Arabic',
    native: 'العربية',
    locale: 'ar-SA',
    scripts: ['Arabic'],
    sample: 'مرحبًا، أنا الفني. جئت لإصلاح جهازك.',
    rtl: true,
  },
  {
    code: 'fr',
    name: 'French',
    native: 'Français',
    locale: 'fr-FR',
    scripts: ['Latin'],
    sample: 'Bonjour, je suis le technicien. Je viens réparer votre appareil.',
  },
  {
    code: 'ko',
    name: 'Korean',
    native: '한국어',
    locale: 'ko-KR',
    scripts: ['Hangul'],
    sample: '안녕하세요, 저는 기술자입니다. 기기를 수리하러 왔습니다.',
  },
  {
    code: 'ru',
    name: 'Russian',
    native: 'Русский',
    locale: 'ru-RU',
    scripts: ['Cyrillic'],
    sample: 'Здравствуйте, я техник. Я пришёл отремонтировать ваше устройство.',
  },
  {
    code: 'ht',
    name: 'Haitian Creole',
    native: 'Kreyòl ayisyen',
    locale: 'ht-HT',
    scripts: ['Latin'],
    sample: 'Bonjou, mwen se teknisyen an. Mwen vin repare aparèy ou a.',
  },
  {
    code: 'pt',
    name: 'Portuguese',
    native: 'Português',
    locale: 'pt-BR',
    scripts: ['Latin'],
    sample: 'Olá, sou o técnico. Vim consertar o seu aparelho.',
  },
  {
    code: 'de',
    name: 'German',
    native: 'Deutsch',
    locale: 'de-DE',
    scripts: ['Latin'],
    sample: 'Hallo, ich bin der Techniker. Ich bin hier, um Ihr Gerät zu reparieren.',
  },
  {
    code: 'ur',
    name: 'Urdu',
    native: 'اردو',
    locale: 'ur-PK',
    scripts: ['Arabic'],
    sample: 'السلام علیکم، میں ٹیکنیشن ہوں۔ میں آپ کا آلہ ٹھیک کرنے آیا ہوں۔',
    rtl: true,
  },
  {
    code: 'gu',
    name: 'Gujarati',
    native: 'ગુજરાતી',
    locale: 'gu-IN',
    scripts: ['Gujarati'],
    sample: 'નમસ્તે, હું ટેકનિશિયન છું. હું તમારું ઉપકરણ રિપેર કરવા આવ્યો છું.',
  },
  {
    code: 'bn',
    name: 'Bengali',
    native: 'বাংলা',
    locale: 'bn-IN',
    scripts: ['Bengali'],
    sample: 'নমস্কার, আমি টেকনিশিয়ান। আমি আপনার যন্ত্রটি মেরামত করতে এসেছি।',
  },
  {
    code: 'pa',
    name: 'Punjabi',
    native: 'ਪੰਜਾਬੀ',
    locale: 'pa-IN',
    scripts: ['Gurmukhi'],
    sample: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ, ਮੈਂ ਟੈਕਨੀਸ਼ੀਅਨ ਹਾਂ। ਮੈਂ ਤੁਹਾਡਾ ਉਪਕਰਣ ਠੀਕ ਕਰਨ ਆਇਆ ਹਾਂ।',
  },
  {
    code: 'ta',
    name: 'Tamil',
    native: 'தமிழ்',
    locale: 'ta-IN',
    scripts: ['Tamil'],
    sample: 'வணக்கம், நான் டெக்னீஷியன். உங்கள் சாதனத்தை சரிசெய்ய வந்துள்ளேன்.',
  },
  {
    code: 'pl',
    name: 'Polish',
    native: 'Polski',
    locale: 'pl-PL',
    scripts: ['Latin'],
    sample: 'Dzień dobry, jestem technikiem. Przyszedłem naprawić Pana urządzenie.',
  },
  {
    code: 'fa',
    name: 'Persian',
    native: 'فارسی',
    locale: 'fa-IR',
    scripts: ['Arabic'],
    sample: 'سلام، من تکنسین هستم. آمده‌ام دستگاه شما را تعمیر کنم.',
    rtl: true,
  },
  {
    code: 'ja',
    name: 'Japanese',
    native: '日本語',
    locale: 'ja-JP',
    scripts: ['Han', 'Hiragana', 'Katakana'],
    sample: 'こんにちは、技術者です。機器の修理に伺いました。',
  },
  {
    code: 'it',
    name: 'Italian',
    native: 'Italiano',
    locale: 'it-IT',
    scripts: ['Latin'],
    sample: 'Buongiorno, sono il tecnico. Sono qui per riparare il suo apparecchio.',
  },
]

export function findLanguage(code: string): Language | undefined {
  return LANGUAGES.find((l) => l.code === code)
}
