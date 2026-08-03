import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function staticRouteRedirectPlugin() {
  const redirectMap: Record<string, string> = {
    '/posts': '/posts/index.html',
    '/posts/': '/posts/index.html',
    '/updates': '/updates/index.html',
    '/updates/': '/updates/index.html',
    '/login': '/login/index.html',
    '/login/': '/login/index.html',
    '/books': '/books/index.html',
    '/books/': '/books/index.html',
  }

  const redirectMiddleware = (req: { url?: string }, res: { statusCode: number; setHeader: (name: string, value: string) => void; end: () => void }, next: () => void) => {
    const target = req.url ? redirectMap[req.url] : undefined
    if (!target) {
      next()
      return
    }

    res.statusCode = 302
    res.setHeader('Location', target)
    res.end()
  }

  return {
    name: 'static-route-redirect',
    configureServer(server: { middlewares: { use: (fn: (req: { url?: string }, res: { statusCode: number; setHeader: (name: string, value: string) => void; end: () => void }, next: () => void) => void) => void } }) {
      server.middlewares.use(redirectMiddleware)
    },
    configurePreviewServer(server: { middlewares: { use: (fn: (req: { url?: string }, res: { statusCode: number; setHeader: (name: string, value: string) => void; end: () => void }, next: () => void) => void) => void } }) {
      server.middlewares.use(redirectMiddleware)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), staticRouteRedirectPlugin()],
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
