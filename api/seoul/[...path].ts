import type { VercelRequest, VercelResponse } from '@vercel/node'

const SEOUL_API = 'http://openapi.seoul.go.kr:8088'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const raw = req.query.path
  const segments = Array.isArray(raw) ? raw : raw ? [raw] : []
  const apiPath = segments.map((s) => String(s)).join('/')

  if (!apiPath) {
    res.status(400).json({ error: 'Missing API path' })
    return
  }

  const targetUrl = `${SEOUL_API}/${apiPath}`

  try {
    const upstream = await fetch(targetUrl)
    const body = await upstream.text()
    const contentType =
      upstream.headers.get('content-type') ?? 'application/json; charset=utf-8'

    res.setHeader('Content-Type', contentType)
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
    res.status(upstream.status).send(body)
  } catch (error) {
    res.status(502).json({
      error: 'Seoul Open API proxy error',
      detail: error instanceof Error ? error.message : String(error),
    })
  }
}
