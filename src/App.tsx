import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import './App.css'
import ChatHeader from './components/ChatHeader/ChatHeader.tsx'
import Composer from './components/Composer/Composer.tsx'
import InstallBanner from './components/InstallBanner/InstallBanner.tsx'
import MessageList from './components/MessageList/MessageList.tsx'
import NoticeBanner from './components/NoticeBanner/NoticeBanner.tsx'
import PWABadge from './components/PWABadge/PWABadge.tsx'
import { useChat } from './hooks/useChat.ts'
import { useOnline } from './hooks/useOnline.ts'
import { useSpeakerText } from './hooks/useSpeakerText.ts'
import { useTheme } from './hooks/useTheme.ts'
import { loadChat, saveChat } from './storage.ts'
import type { Notice, Speaker } from './types.ts'

function App() {
  const { i18n } = useTranslation()
  const [initial] = useState(loadChat)
  const [customerLanguage, setCustomerLanguage] = useState(initial.customerLanguage)
  const [speaker, setSpeaker] = useState<Speaker>('technician')
  const [notice, setNotice] = useState<Notice | null>(null)
  const online = useOnline()
  const { theme, toggleTheme } = useTheme()

  // The technician's language is also the app's UI language
  const technicianLanguage = i18n.resolvedLanguage ?? 'en'
  const languages = { technician: technicianLanguage, customer: customerLanguage }
  const { tFor, speakerLabel } = useSpeakerText(customerLanguage)

  const chat = useChat({ initialMessages: initial.messages, languages, onNotice: setNotice })

  useEffect(() => {
    saveChat({ messages: chat.messages, customerLanguage })
  }, [chat.messages, customerLanguage])

  return (
    <div className="chat">
      <ChatHeader
        online={online}
        theme={theme}
        onToggleTheme={toggleTheme}
        canClear={chat.messages.length > 0}
        onClear={chat.clear}
        technicianLanguage={technicianLanguage}
        onTechnicianLanguageChange={(code) => void i18n.changeLanguage(code)}
        customerLanguage={customerLanguage}
        onCustomerLanguageChange={setCustomerLanguage}
      />

      <InstallBanner />

      <MessageList
        messages={chat.messages}
        online={online}
        languages={languages}
        speakerLabel={speakerLabel}
        canRetry={chat.canRetry}
        onRetry={chat.retry}
        onTranslate={chat.translateTo}
      />

      {notice && <NoticeBanner notice={notice} onClose={() => setNotice(null)} />}

      <Composer
        speaker={speaker}
        onSpeakerChange={setSpeaker}
        online={online}
        languages={languages}
        speakerLabel={speakerLabel}
        tFor={tFor}
        onSendText={(text) => chat.sendText(speaker, text)}
        onSendAudio={(audio) => chat.sendAudio(speaker, audio)}
        onNotice={setNotice}
      />

      <PWABadge />
    </div>
  )
}

export default App
