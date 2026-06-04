export const config = {
  runtime: 'edge',
}

const SEOUL_API = 'http://openapi.seoul.go.kr:8088'

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const apiPath = url.pathname.replace(/^\/api\/seoul\/?/, '')

  if (!apiPath) {
    return Response.json({ error: 'Missing API path' }, { status: 400 })
  }

  const targetUrl = `${SEOUL_API}/${apiPath}${url.search}`

  try {
    const upstream = await fetch(targetUrl)
    const body = await upstream.text()

    return new Response(body, {
      status: upstream.status,
      headers: {
        'Content-Type':
          upstream.headers.get('content-type') ??
          'application/json; charset=utf-8',
        'Cache-Control': 's-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    return Response.json(
      {
        error: 'Seoul Open API proxy error',
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 502 },
    )
  }
}
