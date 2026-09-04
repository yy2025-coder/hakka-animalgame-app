import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 本機開發用 proxy：客語 TTS 走 8461（見 taigi-hakka-app-builder skill v2）。
// allowedHosts 用布林值 true，避免 Cloudflare Tunnel 等外部網域被擋。
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true,
    proxy: {
      '/tts-api': {
        target: 'https://140.113.30.204:8461',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/tts-api/, ''),
      },
    },
  },
})
