# Vibe Shopping Mall - Server

Node.js + Express + MongoDB API 서버입니다.

## 요구사항

- Node.js 18+
- MongoDB (로컬 또는 Atlas)

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 환경 변수 설정 (.env.example을 복사 후 .env 생성)
copy .env.example .env

# 개발 모드 (파일 변경 시 자동 재시작)
npm run dev

# 프로덕션 실행
npm start
```

## 환경 변수

| 변수 | 설명 | 기본값 |
|------|------|--------|
| PORT | 서버 포트 | 5000 |
| MONGODB_URI | MongoDB 연결 URI | mongodb://localhost:27017/vibe-shoping-mall |

## API

- `GET /` - API 정보
- `GET /api/health` - 헬스 체크

## 폴더 구조

```
server/
├── src/
│   ├── config/     # DB 등 설정
│   ├── models/     # Mongoose 스키마
│   ├── routes/     # API 라우트
│   ├── app.js      # Express 앱
│   └── index.js    # 진입점
├── .env.example
├── package.json
└── README.md
```
