# Vibe 쇼핑몰 배포 가이드

실제 서비스 가능한 배포를 위한 단계별 가이드입니다.

---

## 1. 배포 순서 (권장)

1. **데이터베이스** (MongoDB Atlas) → 먼저 만들고 URI 확보
2. **백엔드** (Render / Railway 등) → DB 연결 테스트
3. **프론트엔드** (Vercel / Netlify) → 백엔드 API URL 연결

---

## 2. 데이터베이스: MongoDB Atlas

### 2.1 계정 및 클러스터 생성

1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) 가입
2. **Create** → **M0 Free** 클러스터 선택 (무료)
3. 리전: `Seoul (ap-northeast-2)` 또는 가까운 아시아 리전
4. **Create Cluster** 완료

### 2.2 DB 사용자 생성

1. **Database Access** → **Add New Database User**
2. Username / Password 설정 (안전한 비밀번호)
3. **Add User**

### 2.3 네트워크 접속 허용

1. **Network Access** → **Add IP Address**
2. 배포 시: **Allow Access from Anywhere** (`0.0.0.0/0`) 선택
   - 보안: 프로덕션에서는 백엔드 IP만 허용 권장

### 2.4 연결 문자열 확보

1. **Database** → **Connect** → **Connect your application**
2. **Driver**: Node.js 선택
3. URI 복사 (예: `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`)
4. `<password>` 부분을 실제 비밀번호로 교체
5. DB 이름 추가: `...mongodb.net/vibe-shoping-mall?retryWrites=...`

최종 예시:
```
mongodb+srv://admin:MyPassword123@cluster0.xxxxx.mongodb.net/vibe-shoping-mall?retryWrites=true&w=majority
```

---

## 3. 백엔드: Render (무료 플랜 사용)

### 3.1 Render 설정

1. [Render](https://render.com) 가입
2. **Dashboard** → **New** → **Web Service**
3. GitHub 연결 후 `vibe-shoping-mall-demo` 저장소 선택

### 3.2 빌드/실행 설정

| 항목 | 값 |
|------|-----|
| **Root Directory** | `server` |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |

### 3.3 환경 변수

**Environment** 탭에서 추가:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | `mongodb+srv://...` (Atlas에서 복사한 URI) |
| `PORT` | `5000` (Render는 자동 지정하므로 생략 가능) |
| `JWT_SECRET` | 랜덤한 긴 문자열 (예: `openssl rand -hex 32`) |

### 3.4 주의사항

- **이미지 업로드**: Render 무료 플랜은 휘발성 파일시스템이라, 서버 재시작 시 `uploads/` 파일이 사라집니다.  
  - 테스트용: 현재 구조로 사용 가능  
  - 실서비스: AWS S3, Cloudinary 등으로 업로드 저장소 분리 권장

### 3.5 배포 후 URL 확보

예: `https://vibe-shoping-mall-api.onrender.com`  
이 URL을 프론트엔드 API 주소로 사용합니다.

---

## 4. 프론트엔드: Vercel

### 4.1 Vercel 설정

1. [Vercel](https://vercel.com) 가입
2. **Add New** → **Project**
3. GitHub에서 `vibe-shoping-mall-demo` 선택

### 4.2 빌드 설정

| 항목 | 값 |
|------|-----|
| **Root Directory** | `client` |
| **Framework Preset** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

### 4.3 환경 변수

**Environment Variables** 추가:

| Key | Value |
|-----|-------|
| `VITE_API_BASE_URL` | `https://vibe-shoping-mall-api.onrender.com/api` |
| `VITE_PORTONE_PG` | `html5_inicis.INIpayTest` (테스트) 또는 실제 PG 값 |

- 백엔드가 다른 도메인이면 반드시 전체 URL로 지정해야 합니다.

### 4.4 배포

배포 후 예: `https://vibe-shoping-mall.vercel.app`

---

## 5. CORS 설정 (필요 시)

프론트 도메인이 다를 경우, 서버에서 해당 도메인만 허용하도록 CORS를 제한할 수 있습니다.

`server/src/app.js`:

```javascript
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
};
app.use(cors(corsOptions));
```

환경 변수 예:
```
CORS_ORIGIN=https://vibe-shoping-mall.vercel.app
```

---

## 6. 환경 변수 체크리스트

### 백엔드 (server)

| 변수 | 설명 | 예시 |
|------|------|------|
| `MONGODB_URI` | MongoDB 연결 문자열 | `mongodb+srv://...` |
| `PORT` | 서버 포트 (대부분 플랫폼에서 자동) | `5000` |
| `JWT_SECRET` | JWT 서명용 시크릿 | 랜덤 32자 이상 |
| `CORS_ORIGIN` | 허용 프론트 도메인 (선택) | `https://...vercel.app` |

### 프론트엔드 (client)

| 변수 | 설명 | 예시 |
|------|------|------|
| `VITE_API_BASE_URL` | 백엔드 API 기본 URL | `https://xxx.onrender.com/api` |
| `VITE_PORTONE_PG` | 포트원 PG 채널 | `html5_inicis.INIpayTest` |

---

## 7. 배포 후 테스트

1. 프론트 URL 접속 → 회원가입/로그인 확인
2. 상품 등록 (어드민)
3. 주문/결제 플로우
4. 어드민 주문 관리

---

## 8. 대안 플랫폼

| 구분 | 플랫폼 | 특징 |
|------|--------|------|
| **DB** | MongoDB Atlas | 무료 M0 |
| **백엔드** | Railway, Fly.io, Cyclic | 무료 티어, Node.js 지원 |
| **프론트** | Netlify | Vite 지원, Vercel과 유사 |

---

## 9. 포트원(결제) 실서비스 전환

- 테스트: `VITE_PORTONE_PG=html5_inicis.INIpayTest` 유지
- 실서비스:
  1. 포트원 관리자 콘솔에서 PG 계약 완료
  2. `VITE_PORTONE_PG`를 실제 PG 채널로 변경
  3. CheckoutPage.jsx의 `PORTONE_STORE_ID` 확인

---

## 10. 트러블슈팅

| 증상 | 확인 사항 |
|------|-----------|
| CORS 에러 | 서버 `CORS_ORIGIN`에 프론트 URL 포함 여부 |
| API 404 | `VITE_API_BASE_URL` 끝에 `/api` 포함 여부 |
| DB 연결 실패 | Atlas 네트워크 `0.0.0.0/0` 허용, URI 비밀번호 정확성 |
| 이미지 안 보임 | Render는 휘발성 스토리지이므로 재배포 시 사라짐 (S3/Cloudinary 권장) |
