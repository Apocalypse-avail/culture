export interface CulturalEvent {
  CODENAME: string
  GUNAME: string
  TITLE: string
  DATE: string
  PLACE: string
  ORG_NAME: string
  USE_TRGT: string
  USE_FEE: string
  INQUIRY: string
  PLAYER: string
  PROGRAM: string
  ETC_DESC: string
  ORG_LINK: string
  MAIN_IMG: string
  RGSTDATE: string
  TICKET: string
  STRTDATE: string
  END_DATE: string
  THEMECODE: string
  LOT: string
  LAT: string
  IS_FREE: string
  HMPG_ADDR: string
  PRO_TIME: string
}

export interface EventFilters {
  codename: string
  title: string
  date: string
}

export interface FetchEventsResult {
  events: CulturalEvent[]
  totalCount: number
  code: string
  message: string
}
