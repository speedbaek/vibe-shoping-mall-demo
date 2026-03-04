# Vibe Shopping Mall - Client

React + Vite 기반 프론트엔드입니다.

## 요구사항

- Node.js 18+

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 (http://localhost:5173)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과물 미리보기
npm run preview
```

## 환경 변수

| 변수 | 설명 | 기본값 |
|------|------|--------|
| VITE_API_BASE_URL | API 베이스 URL | /api |

개발 시 `/api` 요청은 `vite.config.js`의 proxy를 통해 백엔드(기본 5000 포트)로 전달됩니다.

## 폴더 구조

```
client/
├── public/           # 정적 파일 (favicon 등)
├── src/
│   ├── assets/       # 이미지, 폰트 등
│   ├── components/   # 재사용 컴포넌트
│   ├── hooks/        # 커스텀 훅
│   ├── pages/        # 페이지 컴포넌트
│   ├── utils/        # 유틸 함수
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
└── package.json
```

## 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 실행 (HMR) |
| `npm run build` | 프로덕션 빌드 |
| `npm run preview` | 빌드 결과 로컬 미리보기 |
