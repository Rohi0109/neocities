import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['rohan-thinkcentre-m625q.tailaa33f5.ts.net'],
    proxy: {
      '/api': 'http://127.0.0.1:5000',
    },
  },
  preview: {
    allowedHosts: ['rohan-thinkcentre-m625q.tailaa33f5.ts.net'],
  },
})
