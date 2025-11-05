# Render.com 배포 체크리스트

## 배포 전 준비사항

### 1. 코드 준비
- [ ] 모든 변경사항이 Git에 커밋되어 있음
- [ ] GitHub 저장소에 푸시되어 있음
- [ ] `.env` 파일이 `.gitignore`에 포함되어 있음
- [ ] `node_modules`가 `.gitignore`에 포함되어 있음

### 2. 백엔드 설정 확인
- [ ] `server/package.json`에 `start` 스크립트가 있음
- [ ] 환경 변수 사용 코드가 올바르게 설정되어 있음 (`process.env.PORT`, `process.env.DB_URL` 등)
- [ ] CORS 설정이 되어 있음

### 3. 프론트엔드 설정 확인
- [ ] `ui/package.json`에 `build` 스크립트가 있음
- [ ] API URL이 환경 변수로 설정되어 있음 (`VITE_API_BASE`)
- [ ] 빌드 후 `dist` 폴더가 생성되는지 확인

---

## 배포 단계별 체크리스트

### 1단계: PostgreSQL 데이터베이스 생성
- [ ] Render Dashboard에서 PostgreSQL 데이터베이스 생성
- [ ] 데이터베이스 이름, 사용자명, 비밀번호 기록
- [ ] Internal Database URL 복사 및 저장
- [ ] 데이터베이스가 "Available" 상태인지 확인

### 2단계: 백엔드 서버 배포
- [ ] Render Dashboard에서 Web Service 생성
- [ ] GitHub 저장소 연결
- [ ] Root Directory: `server` 설정
- [ ] Build Command: `npm install` 설정
- [ ] Start Command: `npm start` 설정
- [ ] 환경 변수 설정:
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=10000` (또는 Render가 자동 설정)
  - [ ] `DB_URL=jdbc:postgresql://...`
  - [ ] `DB_USERNAME=...`
  - [ ] `DB_PASSWORD=...`
- [ ] 배포 완료 대기
- [ ] 로그 확인 (에러 없음)
- [ ] 헬스 체크: `https://your-server.onrender.com/api/health`
- [ ] API 테스트: `https://your-server.onrender.com/api/menus`

### 3단계: 프론트엔드 배포
- [ ] Render Dashboard에서 Static Site 생성
- [ ] GitHub 저장소 연결
- [ ] Root Directory: `ui` 설정
- [ ] Build Command: `npm install && npm run build` 설정
- [ ] Publish Directory: `dist` 설정
- [ ] 환경 변수 설정:
  - [ ] `VITE_API_BASE=https://your-server.onrender.com/api`
- [ ] 배포 완료 대기
- [ ] 프론트엔드 URL 접속 확인
- [ ] 브라우저 콘솔에서 에러 확인 (없어야 함)

---

## 배포 후 테스트

### 기능 테스트
- [ ] 메뉴 목록이 정상적으로 표시됨
- [ ] 메뉴 이미지가 정상적으로 표시됨
- [ ] 옵션 선택 기능 정상 작동
- [ ] 장바구니에 담기 기능 정상 작동
- [ ] 장바구니 수량 조절 기능 정상 작동
- [ ] 주문하기 기능 정상 작동
- [ ] 관리자 화면 접속 가능
- [ ] 관리자 대시보드 데이터 표시 정상
- [ ] 재고 현황 표시 및 조절 정상
- [ ] 주문 현황 표시 정상
- [ ] 주문 상태 변경 기능 정상 작동
- [ ] 자동 새로고침 기능 정상 작동

### API 테스트
- [ ] `GET /api/menus` 응답 정상
- [ ] `GET /api/orders` 응답 정상
- [ ] `POST /api/orders` 주문 생성 정상
- [ ] `PATCH /api/orders/:id/status` 상태 변경 정상
- [ ] `PATCH /api/menus/:id/stock` 재고 변경 정상

### 데이터베이스 테스트
- [ ] 주문 생성 시 데이터베이스에 저장됨
- [ ] 재고 변경 시 데이터베이스에 반영됨
- [ ] 주문 상태 변경 시 데이터베이스에 반영됨

---

## 문제 해결 체크리스트

### 백엔드 문제
- [ ] 로그에서 에러 메시지 확인
- [ ] 환경 변수가 올바르게 설정되어 있는지 확인
- [ ] 데이터베이스 연결 정보 확인
- [ ] 포트 설정 확인 (`process.env.PORT` 사용)

### 프론트엔드 문제
- [ ] 브라우저 콘솔 에러 확인
- [ ] 네트워크 탭에서 API 호출 확인
- [ ] CORS 에러 확인
- [ ] API URL이 올바른지 확인

### 데이터베이스 문제
- [ ] 데이터베이스가 "Available" 상태인지 확인
- [ ] Internal Database URL 사용 확인
- [ ] 환경 변수 형식 확인 (`jdbc:postgresql://...`)

---

## 배포 완료 후

- [ ] 배포 URL을 문서화
- [ ] 팀원에게 배포 정보 공유
- [ ] 모니터링 설정 (선택사항)
- [ ] 백업 전략 수립 (선택사항)

