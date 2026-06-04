import type { CulturalEvent } from '../types/event'

interface EventCardProps {
  event: CulturalEvent
  selected: boolean
  onSelect: () => void
}

export function EventCard({ event, selected, onSelect }: EventCardProps) {
  const isFree = event.IS_FREE?.includes('무료')

  return (
    <article
      className={`event-card ${selected ? 'selected' : ''}`}
      onClick={onSelect}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
      role="button"
      tabIndex={0}
    >
      <div className="card-image-wrap">
        {event.MAIN_IMG ? (
          <img
            src={event.MAIN_IMG}
            alt=""
            loading="lazy"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        ) : (
          <div className="card-image-placeholder">🎪</div>
        )}
        <span className={`fee-badge ${isFree ? 'free' : 'paid'}`}>
          {event.IS_FREE || '—'}
        </span>
      </div>
      <div className="card-body">
        <span className="card-category">{event.CODENAME}</span>
        <h3>{event.TITLE?.trim()}</h3>
        <p className="card-meta">
          <span>📍 {event.GUNAME}</span>
          <span>🏛 {event.PLACE?.trim()}</span>
        </p>
        <p className="card-date">📅 {event.DATE}</p>
        {event.PRO_TIME && (
          <p className="card-time">🕐 {event.PRO_TIME.trim()}</p>
        )}
      </div>
    </article>
  )
}
