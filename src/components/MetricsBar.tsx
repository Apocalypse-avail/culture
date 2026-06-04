interface MetricsBarProps {
  totalCount: number
  page: number
  pageSize: number
  resultCount: number
  freeCount: number
}

export function MetricsBar({
  totalCount,
  page,
  pageSize,
  resultCount,
  freeCount,
}: MetricsBarProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  return (
    <div className="metrics">
      <div className="metric">
        <span className="metric-label">전체 행사</span>
        <span className="metric-value">{totalCount.toLocaleString()}</span>
      </div>
      <div className="metric">
        <span className="metric-label">현재 페이지</span>
        <span className="metric-value">
          {page} / {totalPages}
        </span>
      </div>
      <div className="metric">
        <span className="metric-label">이번 조회</span>
        <span className="metric-value">{resultCount}</span>
      </div>
      <div className="metric">
        <span className="metric-label">무료 (현재)</span>
        <span className="metric-value highlight">{freeCount}</span>
      </div>
    </div>
  )
}
