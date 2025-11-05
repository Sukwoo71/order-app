# 커피 주문 앱 (Coffee Order App)

사용자가 커피 메뉴를 주문하고, 관리자가 주문을 관리할 수 있는 풀스택 웹 애플리케이션입니다.

## 프로젝트 구조

```
order-app/
├── ui/              # 프론트엔드 (React + Vite)
├── server/           # 백엔드 (Express.js + PostgreSQL)
├── docs/            # 문서 (PRD.md)
└── docker-compose.yml  # Docker Compose 설정
```

## 기술 스택

- **프론트엔드**: React, Vite, JavaScript
- **백엔드**: Node.js, Express.js
- **데이터베이스**: PostgreSQL
- **컨테이너화**: Docker, Docker Compose

## 빠른 시작

### Docker Compose 사용 (권장)

```bash
# 전체 스택 실행 (PostgreSQL + Express 서버)
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 중지
docker-compose down
```

- **서버**: http://localhost:4000
- **프론트엔드**: 별도로 실행 필요 (아래 참고)

### 수동 실행

#### 1. 데이터베이스 설정

PostgreSQL을 로컬에 설치하거나 Docker로 실행:

```bash
# Docker로 PostgreSQL 실행
docker run -d \
  --name coffee-order-postgres \
  -e POSTGRES_USER=wsdn \
  -e POSTGRES_PASSWORD=1234 \
  -e POSTGRES_DB=wsdn \
  -p 5432:5432 \
  postgres:15-alpine
```

#### 2. 백엔드 서버 실행

```bash
cd server
npm install
# .env 파일 생성 (선택사항)
# PORT=4000
# DB_URL=jdbc:postgresql://localhost:5432/wsdn
# DB_USERNAME=wsdn
# DB_PASSWORD=1234
npm run dev
```

서버는 http://localhost:4000 에서 실행됩니다.

#### 3. 프론트엔드 실행

```bash
cd ui
npm install
npm run dev
```

프론트엔드는 http://localhost:5173 에서 실행됩니다.

## 주요 기능

### 주문하기 화면
- 커피 메뉴 선택 및 옵션 선택 (샷 추가, 시럽 추가)
- 장바구니에 담기 및 수량 조절
- 주문하기 (재고 자동 차감)

### 관리자 화면
- 주문 현황 대시보드 (총 주문, 주문 접수, 제조 중, 제조 완료)
- 재고 현황 관리 (재고 수량 조절)
- 주문 상태 관리 (제조 시작 → 제조 중 → 제조 완료)
- 자동 새로고침 (5초 간격)

## API 엔드포인트

- `GET /api/menus` - 메뉴/옵션 목록 조회
- `PATCH /api/menus/:id/stock` - 재고 증감
- `POST /api/orders` - 주문 생성
- `GET /api/orders` - 주문 목록 조회
- `GET /api/orders/:id` - 주문 단건 조회
- `PATCH /api/orders/:id/status` - 주문 상태 변경

자세한 내용은 `docs/PRD.md`를 참고하세요.

## 개발 환경 설정

### 환경 변수

**server/.env** (선택사항):
```env
PORT=4000
DB_URL=jdbc:postgresql://localhost:5432/wsdn
DB_USERNAME=wsdn
DB_PASSWORD=1234
```

**ui/.env** (선택사항):
```env
VITE_API_BASE=http://localhost:4000/api
```

## 데이터베이스

PostgreSQL을 사용하며, 서버 시작 시 자동으로 테이블이 생성되고 초기 데이터가 시드됩니다.

- `menus` - 메뉴 정보
- `options` - 옵션 정보
- `orders` - 주문 정보

## 주의사항

- 개발 환경에서는 DB 연결이 없어도 인메모리 모드로 동작합니다.
- 프로덕션 환경에서는 반드시 PostgreSQL을 연결해야 합니다.
- 모든 타임스탬프는 한국 시간(KST, UTC+9)으로 저장됩니다.

## 라이선스

이 프로젝트는 학습 목적으로 작성되었습니다.

