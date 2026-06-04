import type { Connect } from 'vite'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

const SEOUL_API_TARGET = 'http://openapi.seoul.go.kr:8088'

function seoulApiProxy(): Plugin {
  const middleware: Connect.NextHandleFunction = async (req, res, next) => {
    const url = req.url ?? ''
    if (!url.startsWith('/api/seoul/') && url !== '/api/seoul' && !url.startsWith('/api/seoul?')) {
      return next()
    }

    const upstreamPath = url.replace(/^\/api\/seoul\/?/, '')
    const targetUrl = `${SEOUL_API_TARGET}/${upstreamPath}`

    try {
      const response = await fetch(targetUrl)
      res.statusCode = response.status
      const contentType = response.headers.get('content-type')
      if (contentType) {
        res.setHeader('Content-Type', contentType)
      }
      const body = await response.arrayBuffer()
      res.end(Buffer.from(body))
    } catch (error) {
      res.statusCode = 502
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.end(
        JSON.stringify({
          error: 'Seoul API proxy error',
          detail: error instanceof Error ? error.message : String(error),
        }),
      )
    }
  }

  return {
    name: 'seoul-openapi-proxy',
    configureServer(server) {
      server.middlewares.use(middleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware)
    },
  }
}

export default defineConfig({
  plugins: [react(), seoulApiProxy()],
  server: {
    proxy: {
      '/api/seoul': {
        target: SEOUL_API_TARGET,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/seoul\/?/, '/'),
      },
    },
  },
  preview: {
    proxy: {
      '/api/seoul': {
        target: SEOUL_API_TARGET,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/seoul\/?/, '/'),
      },
    },
  },
})
