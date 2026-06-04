import { useCallback, useEffect, useState } from 'react'
import { fetchCulturalEvents } from './api/events'
import { EventCard } from './components/EventCard'
import { EventDetail } from './components/EventDetail'
import { MetricsBar } from './components/MetricsBar'
import { Sidebar } from './components/Sidebar'
import type { CulturalEvent, EventFilters } from './types/event'
import './App.css'

const defaultFilters: EventFilters = {
  codename: '',
  title: '',
  date: '',
}

function App() {
  const [filters, setFilters] = useState<EventFilters>(defaultFilters)
  const [appliedFilters, setAppliedFilters] = useState<EventFilters>(defaultFilters)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)
  const [events, setEvents] = useState<CulturalEvent[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [selected, setSelected] = useState<CulturalEvent | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apiMessage, setApiMessage] = useState<string | null>(null)

  const loadEvents = useCallback(async () => {
    setLoading(true)
    setError(null)
    setApiMessage(null)
    try {
      const result = await fetchCulturalEvents(page, pageSize, appliedFilters)
      setEvents(result.events)
      setTotalCount(result.totalCount)
      setApiMessage(
        result.code !== 'INFO-000' ? `${result.code}: ${result.message}` : null,
      )
      setSelected((prev) => {
        if (!prev) return null
        const still = result.events.find((e) => e.TITLE === prev.TITLE && e.DATE === prev.DATE)
        return still ?? (result.events[0] ?? null)
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : '조회 중 오류가 발생했습니다.')
      setEvents([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, appliedFilters])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  const handleSearch = () => {
    setAppliedFilters({ ...filters })
    setPage(1)
  }

  const handleReset = () => {
    setFilters(defaultFilters)
    setAppliedFilters(defaultFilters)
    setPage(1)
    setSelected(null)
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const freeCount = events.filter((e) => e.IS_FREE?.includes('무료')).length

  return (
    <div className="app">
      <Sidebar
        filters={filters}
        pageSize={pageSize}
        loading={loading}
        onFiltersChange={setFilters}
        onPageSizeChange={(size) => {
          setPageSize(size)
          setPage(1)
        }}
        onSearch={handleSearch}
        onReset={handleReset}
      />

      <main className="main">
        <header className="main-header">
          <div>
            <h1>서울 문화행사</h1>
            <p>서울문화포털 Open API · culturalEventInfo</p>
          </div>
        </header>

        <MetricsBar
          totalCount={totalCount}
          page={page}
          pageSize={pageSize}
          resultCount={events.length}
          freeCount={freeCount}
        />

        {error && (
          <div className="alert error" style={{ whiteSpace: 'pre-wrap' }}>
            {error}
          </div>
        )}
        {apiMessage && !error && <div className="alert warn">{apiMessage}</div>}

        <div className="content-layout">
          <section className="events-section">
            {loading && events.length === 0 ? (
              <div className="state-box">
                <div className="spinner" />
                <p>행사 정보를 불러오는 중입니다…</p>
              </div>
            ) : events.length === 0 ? (
              <div className="state-box">
                <p>조건에 맞는 행사가 없습니다.</p>
                <p className="muted">필터를 바꾸거나 초기화해 보세요.</p>
              </div>
            ) : (
              <div className={`event-grid ${loading ? 'loading' : ''}`}>
                {events.map((event, i) => (
                  <EventCard
                    key={`${event.TITLE}-${event.DATE}-${i}`}
                    event={event}
                    selected={
                      selected?.TITLE === event.TITLE &&
                      selected?.DATE === event.DATE
                    }
                    onSelect={() => setSelected(event)}
                  />
                ))}
              </div>
            )}

            {totalCount > 0 && (
              <nav className="pagination" aria-label="페이지">
                <button
                  type="button"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => p - 1)}
                >
                  ← 이전
                </button>
                <span>
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((p) => p + 1)}
                >
                  다음 →
                </button>
              </nav>
            )}
          </section>

          <EventDetail event={selected} onClose={() => setSelected(null)} />
        </div>
      </main>
    </div>
  )
}

export default App
