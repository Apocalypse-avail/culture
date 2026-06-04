import { CATEGORY_OPTIONS } from '../api/events'
import type { EventFilters } from '../types/event'

interface SidebarProps {
  filters: EventFilters
  pageSize: number
  loading: boolean
  onFiltersChange: (filters: EventFilters) => void
  onPageSizeChange: (size: number) => void
  onSearch: () => void
  onReset: () => void
}

export function Sidebar({
  filters,
  pageSize,
  loading,
  onFiltersChange,
  onPageSizeChange,
  onSearch,
  onReset,
}: SidebarProps) {
  const set = (key: keyof EventFilters, value: string) =>
    onFiltersChange({ ...filters, [key]: value })

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-icon" aria-hidden>
          🎭
        </span>
        <div>
          <h2>검색 필터</h2>
          <p>서울시 문화행사 Open API</p>
        </div>
      </div>

      <div className="sidebar-section">
        <label htmlFor="codename">분류 (CODENAME)</label>
        <select
          id="codename"
          value={filters.codename}
          onChange={(e) => set('codename', e.target.value)}
        >
          <option value="">전체</option>
          {CATEGORY_OPTIONS.filter(Boolean).map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="sidebar-section">
        <label htmlFor="title">공연/행사명 (TITLE)</label>
        <input
          id="title"
          type="text"
          placeholder="예: 마티네, 일러스트"
          value={filters.title}
          onChange={(e) => set('title', e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
        />
      </div>

      <div className="sidebar-section">
        <label htmlFor="date">날짜 (DATE)</label>
        <input
          id="date"
          type="date"
          value={filters.date}
          onChange={(e) => set('date', e.target.value)}
        />
      </div>

      <div className="sidebar-section">
        <label htmlFor="pageSize">페이지당 개수</label>
        <select
          id="pageSize"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
        >
          {[6, 12, 24, 48].map((n) => (
            <option key={n} value={n}>
              {n}건
            </option>
          ))}
        </select>
      </div>

      <div className="sidebar-actions">
        <button
          type="button"
          className="btn-primary"
          onClick={onSearch}
          disabled={loading}
        >
          {loading ? '조회 중…' : '🔍 조회하기'}
        </button>
        <button type="button" className="btn-ghost" onClick={onReset}>
          초기화
        </button>
      </div>

      <p className="sidebar-hint">
        데이터 출처:{' '}
        <a
          href="https://data.seoul.go.kr/"
          target="_blank"
          rel="noopener noreferrer"
        >
          서울열린데이터광장
        </a>
      </p>
    </aside>
  )
}
