import type { CulturalEvent, EventFilters, FetchEventsResult } from '../types/event'

/** .env 미설정 시 사용 (GitHub Pages 등 배포 환경용) */
const DEFAULT_API_KEY = '776e786a4b7365613130375943726174'
const API_KEY = (import.meta.env.VITE_SEOUL_API_KEY ?? DEFAULT_API_KEY).trim()
const PROXY_PREFIX = '/api/seoul'

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

/** Vite dev 프록시 / Vercel serverless(api/seoul) 공통 경로 */
async function requestSeoulApi(apiPath: string): Promise<unknown> {
  const url = `${PROXY_PREFIX}/${apiPath}`
  const res = await fetch(url)

  if (!res.ok) {
    throw new Error(
      `API 요청 실패 (${res.status}). 배포 환경이면 Vercel 재배포 후 다시 시도해 주세요.`,
    )
  }

  const data = await readJsonResponse(res)
  const info = (data as { culturalEventInfo?: { RESULT?: { CODE?: string } } })
    ?.culturalEventInfo

  if (!info?.RESULT?.CODE && !info) {
    throw new Error('API 응답 형식이 올바르지 않습니다.')
  }

  return data
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
