import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const staticPageRoutes: Record<string, string> = {
  '/books/': '/books/index.html',
  '/login/': '/login/index.html',
  '/posts/': '/posts/index.html',
  '/updates/': '/updates/index.html',
}

function serveStaticDirectoryPages() {
  return {
    name: 'serve-static-directory-pages',
    configureServer(server: { middlewares: { use: (handler: (req: { url?: string }, _res: unknown, next: () => void) => void) => void } }) {
      server.middlewares.use((req, _res, next) => {
        if (req.url) {
          const [pathname, query] = req.url.split('?', 2)
          const page = staticPageRoutes[pathname]
          if (page) {
            req.url = query ? `${page}?${query}` : page
          }
        }
        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [serveStaticDirectoryPages(), react()],
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
