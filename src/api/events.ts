import type { CulturalEvent, EventFilters, FetchEventsResult } from '../types/event'

const API_KEY = (import.meta.env.VITE_SEOUL_API_KEY ?? 'sample').trim()
const SEOUL_API_HOST = 'http://openapi.seoul.go.kr:8088'

function encodeSegment(value: string): string {
  return value.trim() ? encodeURIComponent(value.trim()) : ''
}

/** Open API 경로 (호스트 제외): KEY/json/culturalEventInfo/1/12/ */
export function buildApiPath(
  start: number,
  end: number,
  filters: EventFilters,
): string {
  const segments = [
    API_KEY,
    'json',
    'culturalEventInfo',
    String(start),
    String(end),
  ]

  const hasOptional =
    filters.codename.trim() ||
    filters.title.trim() ||
    filters.date.trim()

  if (hasOptional) {
    segments.push(
      encodeSegment(filters.codename),
      encodeSegment(filters.title),
      encodeSegment(filters.date),
    )
  }

  return `${segments.join('/')}/`
}

function normalizeRows(
  row: CulturalEvent | CulturalEvent[] | undefined,
): CulturalEvent[] {
  if (!row) return []
  return Array.isArray(row) ? row : [row]
}

function parseApiPayload(data: unknown): FetchEventsResult {
  const info = (data as { culturalEventInfo?: Record<string, unknown> })
    ?.culturalEventInfo
  const code = (info?.RESULT as { CODE?: string })?.CODE ?? 'UNKNOWN'
  const message =
    (info?.RESULT as { MESSAGE?: string })?.MESSAGE ?? '알 수 없는 응답'

  if (code === 'INFO-200') {
    return { events: [], totalCount: 0, code, message }
  }

  if (code !== 'INFO-000') {
    return { events: [], totalCount: 0, code, message }
  }

  return {
    events: normalizeRows(info?.row as CulturalEvent | CulturalEvent[] | undefined),
    totalCount: Number(info?.list_total_count) || 0,
    code,
    message,
  }
}

async function readJsonResponse(res: Response): Promise<unknown> {
  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch {
    throw new Error('API 응답을 JSON으로 해석할 수 없습니다.')
  }
}

/** 로컬 프록시 → 직접 호출 순으로 시도 */
async function requestSeoulApi(apiPath: string): Promise<unknown> {
  const attempts: { label: string; url: string }[] = [
    { label: 'local-proxy', url: `/api/seoul/${apiPath}` },
    { label: 'direct', url: `${SEOUL_API_HOST}/${apiPath}` },
  ]

  let lastError = 'API 요청에 실패했습니다.'
  let lastStatus = 0

  for (const { label, url } of attempts) {
    try {
      const res = await fetch(url)
      lastStatus = res.status

      if (!res.ok) {
        lastError = `API 요청 실패 (${res.status}) [${label}]`
        continue
      }

      const data = await readJsonResponse(res)
      const info = (data as { culturalEventInfo?: { RESULT?: { CODE?: string } } })
        ?.culturalEventInfo

      if (info?.RESULT?.CODE || info) {
        return data
      }

      lastError = `API 응답 형식 오류 [${label}]`
    } catch (err) {
      if (err instanceof TypeError && label === 'direct') {
        lastError =
          '브라우저에서 API에 직접 연결할 수 없습니다. npm run dev 로 실행해 주세요.'
        continue
      }
      lastError =
        err instanceof Error ? err.message : 'API 요청 중 오류가 발생했습니다.'
    }
  }

  if (lastStatus === 404) {
    throw new Error(
      `${lastError}\n\n개발 서버로 실행했는지 확인해 주세요:\n  npm run dev\n그 후 http://localhost:5173 접속`,
    )
  }

  throw new Error(lastError)
}

export async function fetchCulturalEvents(
  page: number,
  pageSize: number,
  filters: EventFilters,
): Promise<FetchEventsResult> {
  if (!API_KEY) {
    throw new Error(
      '.env 파일에 VITE_SEOUL_API_KEY를 설정한 뒤 개발 서버를 다시 시작해 주세요.',
    )
  }

  const start = (page - 1) * pageSize + 1
  const end = page * pageSize

  if (API_KEY === 'sample' && end - start + 1 > 5) {
    throw new Error(
      '샘플 키(sample)는 한 번에 최대 5건만 조회할 수 있습니다. .env에 발급받은 API 키를 넣어 주세요.',
    )
  }

  const apiPath = buildApiPath(start, end, filters)
  const data = await requestSeoulApi(apiPath)
  return parseApiPayload(data)
}

export const CATEGORY_OPTIONS = [
  '',
  '클래식',
  '콘서트',
  '무용',
  '연극',
  '전시/미술',
  '축제',
  '영화',
  '기타',
  '교육/체험',
  '국악',
  '문학',
  '뮤지컬/오페라',
  '캠핑',
  '마술',
  '복합',
]
