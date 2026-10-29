# WOM Technician Chat (POC)

A Progressive Web App that lets a technician who doesn't speak English talk with a customer on one shared device.

- **App-level translation**: the whole UI is available in 23 languages (English, Telugu, Hindi and the most-spoken languages in US homes). The technician's language ("My language") sets the UI language. Arabic, Urdu and Persian render right-to-left.
- **Speech → text → translation**: tap the mic and speak. The audio is transcribed with Azure OpenAI `gpt-4o-mini-transcribe` in the speaker's language, translated with an Azure OpenAI chat model, and posted to the chat showing both the original and the translation. The customer can reply the same way (switch the speaker toggle), and their message is translated back into the technician's language.

## Setup

```bash
npm install
cp .env.example .env   # fill in your Azure OpenAI endpoint, key and deployment names
npm run dev            # starts Vite and the API server together
```

The Azure OpenAI key lives only in `.env`, which the API server (`server/index.ts`) reads. The browser never sees the key. In dev, Vite forwards `/api/*` to the server on port 8787.

## Production

```bash
npm run build
npm start              # serves dist/ and /api from one Node process
```

Microphone access and PWA installation need **HTTPS** (or `localhost`). To test on a phone, deploy behind HTTPS or use a tunnel.

## Layout

| Path | What |
| --- | --- |
| `server/index.ts` | Express API: `POST /api/transcribe`, `POST /api/translate`, `GET /api/health` |
| `src/App.tsx` | Chat screen: speaker toggle, mic recording, message list |
| `src/useRecorder.ts` | Microphone recording (WebM on Chrome/Android, MP4 on Safari/iOS) |
| `src/languages.ts` | Supported languages, shared by the app and the server |
| `src/i18n/locales/*.ts` | UI strings. `en.ts` is the source; other locales must have the same keys |

To add a UI language, add it to `src/languages.ts`, create `src/i18n/locales/<code>.ts`, and register it in `src/i18n/index.ts`.
