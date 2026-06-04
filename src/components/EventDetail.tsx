import type { CulturalEvent } from '../types/event'

interface EventDetailProps {
  event: CulturalEvent | null
  onClose: () => void
}

function DetailRow({ label, value }: { label: string; value?: string }) {
  const text = value?.trim()
  if (!text) return null
  return (
    <div className="detail-row">
      <dt>{label}</dt>
      <dd>{text}</dd>
    </div>
  )
}

export function EventDetail({ event, onClose }: EventDetailProps) {
  if (!event) {
    return (
      <div className="detail-panel empty">
        <p>카드를 선택하면 상세 정보가 표시됩니다.</p>
      </div>
    )
  }

  const mapUrl =
    event.LAT && event.LOT
      ? `https://map.kakao.com/link/map/${encodeURIComponent(event.PLACE?.trim() || '행사장')},${event.LAT},${event.LOT}`
      : null

  return (
    <div className="detail-panel">
      <button type="button" className="detail-close" onClick={onClose} aria-label="닫기">
        ✕
      </button>
      {event.MAIN_IMG && (
        <img
          className="detail-hero"
          src={event.MAIN_IMG}
          alt=""
          onError={(e) => {
            ;(e.target as HTMLImageElement).style.display = 'none'
          }}
        />
      )}
      <div className="detail-content">
        <div className="detail-tags">
          <span className="tag">{event.CODENAME}</span>
          <span className="tag muted">{event.GUNAME}</span>
          <span className={`tag ${event.IS_FREE?.includes('무료') ? 'free' : 'paid'}`}>
            {event.IS_FREE}
          </span>
        </div>
        <h2>{event.TITLE?.trim()}</h2>

        <dl className="detail-list">
          <DetailRow label="기간" value={event.DATE} />
          <DetailRow label="시간" value={event.PRO_TIME} />
          <DetailRow label="장소" value={event.PLACE} />
          <DetailRow label="기관" value={event.ORG_NAME} />
          <DetailRow label="이용대상" value={event.USE_TRGT} />
          <DetailRow label="이용요금" value={event.USE_FEE} />
          <DetailRow label="문의" value={event.INQUIRY} />
          <DetailRow label="출연" value={event.PLAYER} />
          <DetailRow label="프로그램" value={event.PROGRAM} />
          <DetailRow label="기타" value={event.ETC_DESC} />
          <DetailRow label="티켓" value={event.TICKET} />
          <DetailRow label="테마" value={event.THEMECODE} />
        </dl>

        <div className="detail-links">
          {event.HMPG_ADDR && (
            <a href={event.HMPG_ADDR} target="_blank" rel="noopener noreferrer">
              문화포털 상세
            </a>
          )}
          {event.ORG_LINK && (
            <a href={event.ORG_LINK} target="_blank" rel="noopener noreferrer">
              기관 홈페이지
            </a>
          )}
          {mapUrl && (
            <a href={mapUrl} target="_blank" rel="noopener noreferrer">
              지도 보기
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
