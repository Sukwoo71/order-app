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

## 주의
- 현재는 DB 대신 인메모리 저장소를 사용합니다(서버 재기동 시 초기화).
- 실제 DB(PostgreSQL) 연결 및 마이그레이션은 PRD(6.8 샘플 스키마)를 참고해 확장하세요.


