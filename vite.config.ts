import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'icons.svg'],
      manifest: {
        name: 'WOM Technician Chat',
        short_name: 'WOM Chat',
        description: 'Speech translation chat for technicians and customers',
        theme_color: '#646cff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        cleanupOutdatedCaches: true,
        // API calls must always hit the network, never the app shell fallback
        navigateFallbackDenylist: [/^\/api\//],
      },
      devOptions: {
        enabled: true,
        type: 'module',
        // dev-dist has nothing to precache in dev; silences workbox glob warning
        suppressWarnings: true,
      },
    }),
  ],
  server: {
    // API server (server/index.ts) holds the Azure OpenAI key
    proxy: { '/api': 'http://localhost:8787' },
  },
  preview: {
    proxy: { '/api': 'http://localhost:8787' },
  },
})
