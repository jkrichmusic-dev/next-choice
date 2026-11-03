import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// BASE lets GitHub Pages serve from /<repo>/
const base = process.env.BASE ?? '/'

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'apple-touch-icon.png', 'icon-512.png'],
      manifest: {
        name: 'Next Choice',
        short_name: 'Next Choice',
        description: 'Pick the next choice. Ship it. Level up.',
        theme_color: '#07090f',
        background_color: '#07090f',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
    }),
  ],
})
