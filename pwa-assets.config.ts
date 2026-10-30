import {
  defineConfig,
  minimal2023Preset as preset,
} from '@vite-pwa/assets-generator/config'

// Maskable and Apple icons are padded; fill the padding with the brand colour
// instead of the default white so the icon reads as one solid tile.
const brandBackground = { background: '#0085f6' }

export default defineConfig({
  preset: {
    ...preset,
    maskable: { ...preset.maskable, resizeOptions: brandBackground },
    apple: { ...preset.apple, resizeOptions: brandBackground },
  },
  images: ['public/favicon.svg'],
})
