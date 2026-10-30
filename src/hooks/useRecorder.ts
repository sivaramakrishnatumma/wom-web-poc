import { useEffect, useRef, useState } from 'react'

export type RecorderError = 'micDenied' | 'micUnsupported'

// Chrome/Android record WebM, Safari/iOS record MP4; Azure accepts both.
const MIME_TYPES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']

function pickMimeType() {
  return MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type)) ?? ''
}

export function useRecorder() {
  const [recording, setRecording] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<number | undefined>(undefined)

  function cleanup() {
    window.clearInterval(timerRef.current)
    recorderRef.current?.stream.getTracks().forEach((track) => track.stop())
    recorderRef.current = null
    setRecording(false)
    setElapsed(0)
  }

  // Release the microphone if the component unmounts mid-recording
  useEffect(() => cleanup, [])

  async function start(): Promise<RecorderError | null> {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      return 'micUnsupported'
    }
    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch (err) {
      return err instanceof DOMException && err.name === 'NotFoundError'
        ? 'micUnsupported'
        : 'micDenied'
    }

    const mimeType = pickMimeType()
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
    chunksRef.current = []
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }
    recorder.start()
    recorderRef.current = recorder

    const startedAt = Date.now()
    setElapsed(0)
    setRecording(true)
    timerRef.current = window.setInterval(
      () => setElapsed(Math.floor((Date.now() - startedAt) / 1000)),
      250,
    )
    return null
  }

  // Resolves with the recorded audio, or null if nothing was captured
  function stop(): Promise<Blob | null> {
    const recorder = recorderRef.current
    if (!recorder) return Promise.resolve(null)
    return new Promise((resolve) => {
      recorder.onstop = () => {
        const type = recorder.mimeType.split(';')[0] || 'audio/webm'
        const blob = new Blob(chunksRef.current, { type })
        cleanup()
        resolve(blob.size > 0 ? blob : null)
      }
      recorder.stop()
    })
  }

  function cancel() {
    const recorder = recorderRef.current
    if (!recorder) return
    recorder.onstop = null
    recorder.stop()
    cleanup()
  }

  return { recording, elapsed, start, stop, cancel }
}
