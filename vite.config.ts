import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['rohan-thinkcentre-m625q.tailaa33f5.ts.net'],
  },
  preview: {
    allowedHosts: ['rohan-thinkcentre-m625q.tailaa33f5.ts.net'],
  },
})
