import type { CulturalEvent, EventFilters, FetchEventsResult } from '../types/event'

const API_KEY = import.meta.env.VITE_SEOUL_API_KEY ?? 'sample'
const BASE = '/api/seoul'

function encodeSegment(value: string): string {
  return value.trim() ? encodeURIComponent(value.trim()) : ''
}

function buildPath(
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

  return `${BASE}/${segments.join('/')}/`
}

function normalizeRows(
  row: CulturalEvent | CulturalEvent[] | undefined,
): CulturalEvent[] {
  if (!row) return []
  return Array.isArray(row) ? row : [row]
}

export async function fetchCulturalEvents(
  page: number,
  pageSize: number,
  filters: EventFilters,
): Promise<FetchEventsResult> {
  const start = (page - 1) * pageSize + 1
  const end = page * pageSize
  const url = buildPath(start, end, filters)

  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`API 요청 실패 (${res.status})`)
  }

  const data = await res.json()
  const info = data.culturalEventInfo
  const code = info?.RESULT?.CODE ?? 'UNKNOWN'
  const message = info?.RESULT?.MESSAGE ?? '알 수 없는 응답'

  if (code === 'INFO-200') {
    return { events: [], totalCount: 0, code, message }
  }

  if (code !== 'INFO-000') {
    return { events: [], totalCount: 0, code, message }
  }

  return {
    events: normalizeRows(info.row),
    totalCount: Number(info.list_total_count) || 0,
    code,
    message,
  }
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
