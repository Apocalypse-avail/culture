# 서울 문화행사 조회 (React)

서울열린데이터광장 **문화행사 정보** Open API(`culturalEventInfo`)를 사용하는 React 웹앱입니다. Streamlit처럼 왼쪽 사이드바에서 필터를 설정하고, 메인 영역에서 카드 목록과 상세 정보를 확인할 수 있습니다.

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` 을 엽니다.

## 환경 변수

`.env` 파일에 API 키를 설정합니다.

```
VITE_SEOUL_API_KEY=발급받은_인증키
```

`.env.example`을 복사해 사용할 수 있습니다.

## 기능

- 분류(CODENAME), 행사명(TITLE), 날짜(DATE) 필터
- 페이지네이션 (6 / 12 / 24 / 48건)
- 행사 카드 그리드 + 우측 상세 패널
- 문화포털·기관 링크, 카카오맵 연동
- Vite 개발 서버 프록시로 CORS 우회

## API

- [서울문화포털 문화행사](http://openapi.seoul.go.kr:8088/)
- 형식: `/{인증키}/json/culturalEventInfo/{시작}/{끝}/`

## 빌드

```bash
npm run build
npm run preview
```
