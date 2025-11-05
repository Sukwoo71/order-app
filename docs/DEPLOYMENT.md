# Render.com 배포 가이드

## 배포 순서

Render.com에서 배포하는 순서는 다음과 같습니다:

1. **PostgreSQL 데이터베이스 생성**
2. **백엔드 서버 (Express) 배포**
3. **프론트엔드 (React) 배포**

---

## 1단계: PostgreSQL 데이터베이스 생성

### 1.1 Render Dashboard에서 데이터베이스 생성

1. [Render Dashboard](https://dashboard.render.com/) 접속
2. **"New +"** 버튼 클릭
3. **"PostgreSQL"** 선택
4. 다음 정보 입력:
   - **Name**: `coffee-order-db` (원하는 이름)
   - **Database**: `wsdn` (또는 원하는 DB 이름)
   - **User**: `wsdn` (또는 원하는 사용자명)
   - **Region**: 가장 가까운 리전 선택 (예: Singapore)
   - **PostgreSQL Version**: 15 (또는 최신)
   - **Plan**: Free 또는 Starter (테스트용)
5. **"Create Database"** 클릭

### 1.2 데이터베이스 연결 정보 확인

생성 후 **"Connections"** 탭에서 다음 정보를 복사해 두세요:
- **Internal Database URL**: `postgresql://wsdn:password@host:5432/wsdn`
- **Host**: 데이터베이스 호스트 주소
- **Port**: 5432
- **Database**: wsdn
- **User**: wsdn
- **Password**: 비밀번호

> **중요**: Internal Database URL은 같은 Render 네트워크 내에서만 사용 가능합니다.

---

## 2단계: 백엔드 서버 배포

### 2.1 GitHub에 코드 푸시

```bash
# Git 저장소가 없다면 초기화
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2.2 Render에서 Web Service 생성

1. Render Dashboard에서 **"New +"** → **"Web Service"** 선택
2. GitHub 저장소 연결 (또는 Public Git 저장소 URL 입력)
3. 다음 정보 입력:
   - **Name**: `coffee-order-server`
   - **Region**: 데이터베이스와 같은 리전 선택
   - **Branch**: `main` (또는 기본 브랜치)
   - **Root Directory**: `server` ⚠️ **중요! 반드시 설정해야 함**
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

> **⚠️ 주의**: Root Directory를 `server`로 설정하지 않으면 `/opt/render/project/src/package.json`을 찾을 수 없다는 에러가 발생합니다.

#### Root Directory 설정 방법

1. Web Service 생성 화면에서 **"Advanced"** 섹션 펼치기
2. **"Root Directory"** 필드에 `server` 입력
3. 또는 생성 후 **Settings** → **"Root Directory"**에서 수정 가능

#### 기존 서비스 수정 방법

이미 서비스를 생성했다면:
1. Render Dashboard → 해당 Web Service 선택
2. **"Settings"** 탭 클릭
3. **"Root Directory"** 섹션에서 `server` 입력
4. **"Save Changes"** 클릭
5. 자동으로 재배포 시작됨

### 2.3 환경 변수 설정

**"Environment"** 섹션에서 다음 환경 변수를 추가:

```env
NODE_ENV=production
PORT=10000
DB_URL=jdbc:postgresql://<host>:5432/<database>
DB_USERNAME=<user>
DB_PASSWORD=<password>
```

**설정 방법**:
- Render Dashboard → Web Service → Environment
- **"Add Environment Variable"** 클릭
- 위의 변수들을 하나씩 추가
- `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`는 1단계에서 생성한 데이터베이스 정보 사용

**예시**:
```env
DB_URL=jdbc:postgresql://dpg-xxxxx-a.singapore-postgres.render.com:5432/wsdn
DB_USERNAME=wsdn
DB_PASSWORD=your_password_here
```

### 2.4 배포 확인

1. **"Save Changes"** 클릭하여 자동 배포 시작
2. 배포가 완료되면 **"Logs"** 탭에서 확인
3. 서버 URL: `https://coffee-order-server.onrender.com` (또는 할당된 URL)
4. 헬스 체크: `https://coffee-order-server.onrender.com/api/health`

### 2.5 백엔드 서버 설정 파일 확인

`server/package.json`에 `start` 스크립트가 있는지 확인:

```json
{
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js"
  }
}
```

---

## 3단계: 프론트엔드 배포

### 3.1 환경 변수 파일 생성

프론트엔드 배포 전에 `ui/.env.production` 파일을 생성하거나, Render에서 환경 변수로 설정:

```env
VITE_API_BASE=https://coffee-order-server.onrender.com/api
```

> **참고**: 2단계에서 얻은 백엔드 서버 URL을 사용하세요.

### 3.2 Render에서 Static Site 생성

1. Render Dashboard에서 **"New +"** → **"Static Site"** 선택
2. GitHub 저장소 연결
3. 다음 정보 입력:
   - **Name**: `coffee-order-ui`
   - **Branch**: `main`
   - **Root Directory**: `ui` (중요!)
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

### 3.3 프론트엔드 환경 변수 설정

**"Environment"** 섹션에서 환경 변수 추가:

```env
VITE_API_BASE=https://coffee-order-server.onrender.com/api
```

> **중요**: 백엔드 서버 URL을 정확히 입력하세요.

### 3.4 배포 확인

1. **"Save Changes"** 클릭하여 배포 시작
2. 배포 완료 후 프론트엔드 URL 확인
3. 브라우저에서 접속하여 테스트

---

## 배포 후 확인 사항

### ✅ 체크리스트

- [ ] PostgreSQL 데이터베이스가 생성되고 실행 중
- [ ] 백엔드 서버가 정상적으로 배포되고 실행 중
- [ ] 백엔드 헬스 체크 엔드포인트 응답 확인 (`/api/health`)
- [ ] 백엔드 API 엔드포인트 응답 확인 (`/api/menus`)
- [ ] 프론트엔드가 정상적으로 배포되고 접속 가능
- [ ] 프론트엔드에서 백엔드 API 호출 정상 작동
- [ ] 메뉴 조회 기능 정상 작동
- [ ] 주문 생성 기능 정상 작동
- [ ] 관리자 화면 정상 작동

### 🔍 문제 해결

#### 백엔드 서버가 시작되지 않는 경우

1. **Logs 확인**: Render Dashboard → Web Service → Logs
2. **환경 변수 확인**: `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`가 올바른지 확인
3. **포트 확인**: Render는 자동으로 `PORT` 환경 변수를 설정합니다. 코드에서 `process.env.PORT`를 사용하는지 확인

#### 프론트엔드에서 API 호출 실패

1. **CORS 설정 확인**: 백엔드에서 CORS가 활성화되어 있는지 확인
2. **API URL 확인**: 프론트엔드 환경 변수 `VITE_API_BASE`가 올바른지 확인
3. **브라우저 콘솔 확인**: 네트워크 에러 메시지 확인

#### 데이터베이스 연결 실패

1. **Internal Database URL 사용**: Render 네트워크 내에서는 Internal URL 사용
2. **환경 변수 형식 확인**: `DB_URL`이 `jdbc:postgresql://...` 형식인지 확인
3. **데이터베이스 상태 확인**: Render Dashboard에서 데이터베이스가 실행 중인지 확인

---

## 추가 설정 (선택사항)

### 커스텀 도메인 연결

1. Render Dashboard → Web Service → Settings
2. **"Custom Domain"** 섹션에서 도메인 추가
3. DNS 설정 가이드에 따라 CNAME 레코드 추가

### 환경 변수 관리

- **개발 환경**: `.env` 파일 사용
- **프로덕션 환경**: Render Dashboard의 Environment Variables 사용
- **비밀 정보**: 절대 Git에 커밋하지 말고 Render에서만 관리

### 빌드 최적화

- 프론트엔드 빌드 시 프로덕션 모드로 빌드되는지 확인
- 불필요한 파일은 `.gitignore`에 추가
- 빌드 시간 단축을 위해 `node_modules` 캐싱 활용

---

## 비용 정보

- **PostgreSQL (Free)**: 90일 무료, 이후 유료
- **Web Service (Free)**: 15분 비활성 시 슬리핑, 무료
- **Static Site (Free)**: 무료

> **참고**: 프로덕션 환경에서는 유료 플랜 사용을 권장합니다.

---

## 다음 단계

배포가 완료되면:
1. 실제 사용자 테스트
2. 성능 모니터링
3. 에러 로깅 설정 (Sentry 등)
4. 백업 전략 수립
5. CI/CD 파이프라인 구축 (선택사항)

---

## 참고 자료

- [Render 공식 문서](https://render.com/docs)
- [PostgreSQL on Render](https://render.com/docs/databases)
- [Web Services on Render](https://render.com/docs/web-services)
- [Static Sites on Render](https://render.com/docs/static-sites)

