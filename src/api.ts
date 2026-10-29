// Client for server/index.ts. The server holds the Azure OpenAI key.

async function post<T>(url: string, init: RequestInit): Promise<T> {
  const res = await fetch(url, { method: 'POST', ...init })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`)
  return data as T
}

// languageMismatch: the transcript isn't in the expected language's script,
// which usually means the wrong speaker/language was selected
export async function transcribe(
  audio: Blob,
  language: string,
): Promise<{ text: string; languageMismatch: boolean }> {
  return post(`/api/transcribe?${new URLSearchParams({ language })}`, {
    headers: { 'Content-Type': audio.type },
    body: audio,
  })
}

export async function translate(text: string, from: string, to: string): Promise<string> {
  if (from === to) return text
  const { text: translated } = await post<{ text: string }>('/api/translate', {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, from, to }),
  })
  return translated
}
