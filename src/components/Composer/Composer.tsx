import type { TFunction } from 'i18next'
import { useEffect, useRef, useState, type KeyboardEvent, type SubmitEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useRecorder } from '../../hooks/useRecorder.ts'
import type { Notice, Speaker } from '../../types.ts'
import { Icon } from '../icons.tsx'
import RecordingBar from '../RecordingBar/RecordingBar.tsx'
import SpeakerToggle from '../SpeakerToggle/SpeakerToggle.tsx'
import './Composer.css'

const MAX_CHARS = 1000
const MAX_RECORDING_SECONDS = 120

type Props = {
  speaker: Speaker
  onSpeakerChange: (who: Speaker) => void
  online: boolean
  languages: Record<Speaker, string>
  speakerLabel: (who: Speaker) => string
  tFor: (who: Speaker) => TFunction
  onSendText: (text: string) => void
  onSendAudio: (audio: Blob) => void
  onNotice: (notice: Notice | null) => void
}

// Bottom bar: who is speaking, plus either the text/mic input or the recording bar
function Composer({
  speaker,
  onSpeakerChange,
  online,
  languages,
  speakerLabel,
  tFor,
  onSendText,
  onSendAudio,
  onNotice,
}: Props) {
  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const recorder = useRecorder()
  const stoppingRef = useRef(false)
  const speakerT = tFor(speaker)

  function sendText(e?: SubmitEvent) {
    e?.preventDefault()
    const text = input.trim()
    if (!text || !online) return
    onSendText(text)
    setInput('')
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      sendText()
    }
  }

  async function startRecording() {
    onNotice(null)
    const error = await recorder.start()
    if (error) onNotice({ key: error })
  }

  async function stopRecording() {
    // The stop button and the time-limit auto-stop can both fire
    if (stoppingRef.current) return
    stoppingRef.current = true
    const audio = await recorder.stop()
    stoppingRef.current = false
    if (audio) onSendAudio(audio)
    else onNotice({ key: 'noSpeech' })
  }

  useEffect(() => {
    if (recorder.recording && recorder.elapsed >= MAX_RECORDING_SECONDS) void stopRecording()
    // stopRecording is recreated each render; only the elapsed time matters here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recorder.recording, recorder.elapsed])

  return (
    <footer className="composer">
      <SpeakerToggle
        speaker={speaker}
        onChange={onSpeakerChange}
        disabled={recorder.recording}
        languages={languages}
        speakerLabel={speakerLabel}
      />

      {recorder.recording ? (
        <RecordingBar
          elapsed={recorder.elapsed}
          speakerT={speakerT}
          onCancel={recorder.cancel}
          onStop={() => void stopRecording()}
        />
      ) : (
        <form className="input-row" onSubmit={sendText}>
          <textarea
            rows={1}
            value={input}
            maxLength={MAX_CHARS}
            placeholder={online ? t('typeMessage') : t('youAreOffline')}
            disabled={!online}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            aria-label={t('typeMessage')}
            lang={languages[speaker]}
            dir="auto"
          />
          {input.trim() ? (
            <button type="submit" className="round send" aria-label={t('send')} title={t('send')}>
              <Icon name="send" size={22} />
            </button>
          ) : (
            <button
              type="button"
              className="round mic"
              onClick={() => void startRecording()}
              disabled={!online}
              aria-label={speakerT('tapToSpeak')}
              title={speakerT('tapToSpeak')}
            >
              <Icon name="mic" size={26} />
            </button>
          )}
        </form>
      )}
    </footer>
  )
}

export default Composer
