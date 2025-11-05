# Coffee Order Server (Express)

개발용 인메모리(메모리 저장) 서버입니다. 프론트엔드(`ui`)와 연동 테스트용으로 사용하세요.

## 실행

```bash
cd server
npm install
npm run dev
# http://localhost:4000/api/health
```

환경변수
- `PORT` (default: 4000)
- 추후 `DATABASE_URL` 등 추가 예정

## 엔드포인트
- `GET /api/menus` — 메뉴/옵션 목록
- `PATCH /api/menus/:id/stock` — 재고 증감 `{ delta }`
- `POST /api/orders` — 주문 생성 `{ items: [{ menuId, quantity, options:[{ optionId }] }] }`
- `GET /api/orders` — 주문 목록(필터: `status`)
- `GET /api/orders/:id` — 주문 단건
- `PATCH /api/orders/:id/status` — 상태 변경(PENDING→IN_PROGRESS→COMPLETED)

## Docker Compose 사용

프로젝트 루트에서 실행:

```bash
# 전체 스택 실행 (PostgreSQL + Express 서버)
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 중지
docker-compose down

# 데이터 유지하며 중지 (볼륨 유지)
docker-compose down

# 데이터까지 삭제
docker-compose down -v
```

## 주의
- DB 연결이 없으면 인메모리 저장소로 자동 폴백합니다(서버 재기동 시 초기화).
- PostgreSQL 연결 시 자동으로 테이블 생성 및 초기 데이터 시드가 진행됩니다.
- 실제 DB(PostgreSQL) 연결 및 마이그레이션은 PRD(6.8 샘플 스키마)를 참고해 확장하세요.


