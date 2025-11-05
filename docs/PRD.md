# 커피 주문 앱

## 1. 프로젝트 개요

###  1.1 프로젝트명
커피 주문 앱

###  1.2 프로젝트 목적
사용자가 커피 메뉴를 주문하고, 관리자가 주문을 관리할 수 있는 간단하 풀스택 웹 앱

###  1.3 개발 범위
- 주문하기 화면(메뉴 선택 및 장바구니 기능)
- 관리자 화면(재고 관리 및 주문 상태 관리)
- 데이터를 생성/조회/수정/삭제 할 수 있는 기능

## 2. 기술 스택
- 프론트엔드: HTML, CSS, 리액트, 자바스크립트
- 백엔드: Node.js, Express
- 데이터베이스: PostgreSQL

## 3. 기본 사항
- 프론트엔드와 벡엔드를 따로 개발
- 기본적인 웹 기술만 사용
- 학습 목적으로 사용자 인증이나 결제 기능은 제외
- 메뉴는 커피 메뉴만 있음

## 4. 프론트엔드 UI - 주문하기 화면

### 4.1 화면 구성

#### 4.1.1 헤더
- `COZY` 로고 또는 브랜드명 표시
- `주문하기` 버튼 (현재 화면)
- `관리자` 버튼 (관리자 페이지로 이동)

#### 4.1.2 메뉴 목록
- 각 메뉴는 카드 형태로 구성
- 메뉴별 이미지 (와이어프레임에서는 Placeholder)
- 메뉴 이름 (예: 아메리카노(ICE), 아메리카노(HOT), 카페라떼)
- 메뉴 가격 (예: 4,000원, 5,000원)
- 간단한 설명 (Placeholder)
- 옵션 선택:
    - 샷 추가 (+500원) 체크박스
    - 시럽 추가 (+0원) 체크박스
- `담기` 버튼

#### 4.1.3 장바구니
- `장바구니` 섹션 제목
- 장바구니에 담긴 메뉴 목록:
    - 메뉴 이름 및 선택된 옵션 (예: 아메리카노(ICE) (샷 추가))
    - 수량 (예: X 1)
    - 각 메뉴별 가격 (예: 4,500원)
- 총 금액 표시 (예: 총 금액 12,500원)
- `주문하기` 버튼

### 4.2 기능 요구사항

#### 4.2.1 메뉴 선택 및 장바구니 담기
- 사용자는 메뉴 카드를 통해 메뉴를 선택할 수 있다.
- 각 메뉴의 옵션(샷 추가, 시럽 추가)을 선택할 수 있다.
- `담기` 버튼을 클릭하면 선택된 메뉴와 옵션, 수량이 장바구니에 추가된다.
- 동일한 메뉴를 다시 담을 경우 수량이 증가하거나, 옵션이 다르면 별도의 항목으로 추가될 수 있다 (추후 확정).

#### 4.2.2 장바구니 관리
- 장바구니에 담긴 메뉴의 수량을 조절할 수 있다 (와이어프레임에는 없으나, 향후 기능 추가 고려).
- 장바구니에서 메뉴를 삭제할 수 있다 (와이어프레임에는 없으나, 향후 기능 추가 고려).
- 장바구니에 담긴 메뉴들의 총 금액이 실시간으로 업데이트되어야 한다.

#### 4.2.3 주문하기
- `주문하기` 버튼을 클릭하면 장바구니에 담긴 모든 메뉴에 대한 주문이 완료된다.
- 주문 완료 후 장바구니는 초기화된다.

### 4.3 사용자 경험 (UX)

- 직관적인 메뉴 탐색 및 선택이 가능해야 한다.
- 장바구니 현황 및 총 금액을 명확하게 확인할 수 있어야 한다.
- 버튼 클릭 시 시각적인 피드백을 제공하여 사용자가 동작을 인지할 수 있도록 한다.

## 5. 프론트엔드 UI - 관리자 화면

### 5.1 화면 구성

#### 5.1.1 헤더
- `COZY` 로고 또는 브랜드명 표시
- `주문하기` 버튼 (주문 화면으로 이동)
- `관리자` 버튼 (현재 화면)

#### 5.1.2 관리자 대시보드
- 현재 주문 현황 요약 정보 표시:
    - 총 주문 수 (예: 총 주문 1)
    - 주문 접수 건수 (예: 주문 접수 1)
    - 제조 중인 건수 (예: 제조 중 0)
    - 제조 완료 건수 (예: 제조 완료 0)

#### 5.1.3 재고 현황
- `재고 현황` 섹션 제목
- 각 메뉴별 현재 재고 수량 표시 (예: 아메리카노 (ICE) 10개)
- 각 메뉴별 재고 수량 조절 버튼 (`+`, `-`)

#### 5.1.4 주문 현황
- `주문 현황` 섹션 제목
- 접수된 주문 목록 표시:
    - 주문 시간 (예: 7월 31일 13:00)
    - 주문 메뉴 및 수량 (예: 아메리카노(ICE) x 1)
    - 주문 금액 (예: 4,000원)
    - 주문 상태 버튼 (예: `주문 접수` - 클릭 시 `제조 중` 등으로 변경 가능)

### 5.2 기능 요구사항

#### 5.2.1 재고 관리
- 관리자는 각 메뉴의 현재 재고 수량을 확인할 수 있다.
- `+`, `-` 버튼을 통해 실시간으로 재고 수량을 조절할 수 있다.

#### 5.2.2 주문 상태 관리
- 관리자는 접수된 주문 목록을 확인할 수 있다.
- 각 주문의 상태를 `주문 접수`, `제조 중`, `제조 완료` 등으로 변경할 수 있다.
- 주문 상태 변경 시 해당 주문의 현황 요약 정보(관리자 대시보드)가 업데이트되어야 한다.

### 5.3 사용자 경험 (UX)

- 현재 주문 및 재고 현황을 한눈에 파악할 수 있도록 직관적인 대시보드를 제공한다.
- 재고 및 주문 상태 변경 시 즉각적인 피드백을 제공한다.
- 중요한 정보(주문 상태, 재고 수량 등)는 명확하게 강조하여 표시한다.

## 6. 백엔드 PRD (API/데이터 설계)

### 6.1 데이터 모델

- Menus
  - id (PK, UUID)
  - name (string, required) — 커피 이름
  - description (string, optional) — 설명
  - price (integer, required) — 기본 가격(원)
  - imageUrl (string, optional) — 이미지 경로/URL
  - stock (integer, required, default: 0) — 재고 수량
  - createdAt (timestamp, required)
  - updatedAt (timestamp, required)

- Options
  - id (PK, UUID)
  - menuId (FK → Menus.id, required) — 어떤 메뉴의 옵션인지
  - name (string, required) — 옵션 이름 (예: 샷 추가)
  - priceDelta (integer, required, default: 0) — 옵션 추가 금액(원)
  - createdAt (timestamp, required)
  - updatedAt (timestamp, required)

- Orders
  - id (PK, UUID)
  - orderedAt (timestamp, required) — 주문 일시
  - status (enum: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED', default: 'PENDING') — 주문 상태
  - totalAmount (integer, required) — 주문 총 금액(원)
  - items (JsonB, required) — 주문 항목 목록
    - items[n].menuId (UUID, required)
    - items[n].menuName (string, denorm)
    - items[n].unitPrice (integer, required) — 단가(옵션 반영 전 기본가)
    - items[n].quantity (integer, required)
    - items[n].options (array of { optionId, optionName, priceDelta })
    - items[n].lineAmount (integer, required) — (기본가+옵션가)*수량
  - createdAt (timestamp, required)
  - updatedAt (timestamp, required)

관계 요약: Menus(1) — Options(N), Orders는 정규화된 상세 테이블 없이 JsonB(items)로 저장(초기 과제 단순화 목적). 이후 확장 시 OrderItems/OrderItemOptions 테이블로 분리 가능.

### 6.2 데이터 스키마를 고려한 사용자 흐름

1) 메뉴 조회 및 표시
- 클라이언트가 GET /api/menus 호출 → Menus와 연결 Options를 함께 취득
- 사용자 화면에 Menus 표시, 재고(stock)는 관리자 화면에서도 표시

2) 장바구니 담기
- 프론트에서 선택 메뉴/옵션/수량을 로컬 상태로 관리(장바구니)

3) 주문 생성
- 사용자가 '주문하기' 클릭 → POST /api/orders로 전송
- 서버는 다음 처리 수행:
  - 요청 Validation (재고 수량, 음수/0 수량, 존재하는 메뉴/옵션인지)
  - 각 라인별 금액 계산 → 주문 총 금액 산출
  - 트랜잭션으로 주문 저장 및 재고 차감(Menus.stock -= quantity 합계)
  - 응답으로 주문 ID와 요약 정보 반환

4) 관리자 주문 현황 표시
- 관리자 화면은 GET /api/orders?status=PENDING 등으로 목록 조회
- 상태 버튼 클릭 시 PATCH /api/orders/:id/status 로 상태 변경(PENDING→IN_PROGRESS→COMPLETED)
- 상태 변경 시 updatedAt 업데이트, 비즈니스 이벤트 로깅(선택)

### 6.3 API 설계

Base URL: /api
응답 포맷: application/json, { data, error } 컨벤션 사용
에러: 4xx(요청/검증 실패), 5xx(서버 오류), 표준화된 코드/메시지 제공

- GET /api/menus
  - desc: 커피 메뉴와 옵션 목록 조회
  - query: includeOptions=true(default) — 옵션 포함 여부
  - res.data: [{ id, name, description, price, imageUrl, stock, options: [{ id, menuId, name, priceDelta }] }]

- POST /api/orders
  - desc: 주문 생성 및 재고 차감(트랜잭션)
  - req.body:
    {
      items: [
        {
          menuId: string,
          quantity: number,
          options: [{ optionId: string }]
        }
      ]
    }
  - 처리:
    1) 메뉴/옵션 유효성 검사
    2) 옵션가 합산 → 라인 금액 계산
    3) 전체 합계 계산
    4) 재고 확인(부족 시 409 Conflict 반환)
    5) 주문 저장 + 재고 차감(commit)
  - res.data: { id, orderedAt, status: 'PENDING', totalAmount, items: [...] }

- PATCH /api/orders/:id/status
  - desc: 주문 상태 변경(PENDING→IN_PROGRESS→COMPLETED)
  - req.body: { status: 'IN_PROGRESS' | 'COMPLETED' }
  - res.data: { id, status, updatedAt }
  - 검증: 허용 전이만 허가, 불가 전이는 400/409

- GET /api/orders
  - desc: 주문 목록 조회
  - query: status(optional), from(optional ISO), to(optional ISO), page, pageSize
  - res.data: { items: [ { id, orderedAt, status, totalAmount, items:[...] } ], page, pageSize, total }

- GET /api/orders/:id
  - desc: 주문 단건 조회
  - res.data: { id, orderedAt, status, totalAmount, items:[...] }

- PATCH /api/menus/:id/stock
  - desc: 재고 증감(관리자 패널에서 +/−)
  - req.body: { delta: number }  // 음수 가능, 결과는 0 미만 불가
  - res.data: { id, stock, updatedAt }

### 6.4 유효성/에러 처리 규칙

- 공통 규칙
  - 숫자 필드(가격/수량/stock): 0 이상 정수
  - 존재하지 않는 메뉴/옵션/주문 ID: 404 Not Found
  - 재고 부족: 409 Conflict, { code: 'OUT_OF_STOCK' }
  - 잘못된 상태 전이: 400 Bad Request, { code: 'INVALID_STATUS_TRANSITION' }

### 6.5 트랜잭션/일관성

- 주문 생성(POST /orders) 시 트랜잭션 경계 내에서 다음을 수행
  1) 재고 확인 및 차감(lock)
  2) 주문 저장
  3) 커밋 후 응답
- 동시 주문 시 재고 음수 방지를 위해 메뉴별 행 잠금(SELECT ... FOR UPDATE) 또는 원자적 업데이트 사용

### 6.6 성능/확장 고려

- 목록 API 페이징(page, pageSize) 필수
- 메뉴/옵션은 변경 빈도가 낮으므로 서버/프론트 캐시 고려(ETag/Last-Modified)
- 주문 현황 폴링(예: 5~10초) 또는 SSE/WebSocket은 추후 확장

### 6.7 보안/운영

- 초기 과제 범위에서 인증/인가 제외(필요 시 관리자 엔드포인트 보호)
- 요청 로깅(메서드/경로/지연/상태코드) 및 에러 로깅
- .env 구성: DATABASE_URL, PORT 등

### 6.8 샘플 스키마 (PostgreSQL)

```sql
CREATE TABLE menus (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL CHECK (price >= 0),
  image_url TEXT,
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE options (
  id UUID PRIMARY KEY,
  menu_id UUID NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price_delta INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE orders (
  id UUID PRIMARY KEY,
  ordered_at TIMESTAMP NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('PENDING','IN_PROGRESS','COMPLETED')),
  total_amount INTEGER NOT NULL CHECK (total_amount >= 0),
  items JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_options_menu_id ON options(menu_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_ordered_at ON orders(ordered_at);
```

### 6.9 요청/응답 예시

- GET /api/menus 응답 예시
```json
{
  "data": [
    {
      "id": "...",
      "name": "아메리카노(ICE)",
      "description": "시원한 아이스 아메리카노",
      "price": 4000,
      "imageUrl": "/americano-ice.jpg",
      "stock": 10,
      "options": [
        { "id": "...", "menuId": "...", "name": "샷 추가", "priceDelta": 500 },
        { "id": "...", "menuId": "...", "name": "시럽 추가", "priceDelta": 0 }
      ]
    }
  ]
}
```

- POST /api/orders 요청/응답 예시
```json
// Request
{
  "items": [
    {
      "menuId": "...",
      "quantity": 2,
      "options": [ { "optionId": "..." } ]
    }
  ]
}

// Response
{
  "data": {
    "id": "...",
    "orderedAt": "2025-11-05T12:34:56.000Z",
    "status": "PENDING",
    "totalAmount": 9000,
    "items": [
      {
        "menuId": "...",
        "menuName": "아메리카노(ICE)",
        "unitPrice": 4000,
        "quantity": 2,
        "options": [ { "optionId": "...", "optionName": "샷 추가", "priceDelta": 500 } ],
        "lineAmount": 9000
      }
    ]
  }
}
```

이 백엔드 PRD는 현재 프론트엔드 구현(메뉴 조회, 장바구니, 주문 생성, 관리자 상태 관리, 재고 차감)과 정합성을 맞추었으며, 초기 학습/프로토타입 단계에서 구현 복잡도를 줄이기 위해 주문 상세를 JsonB로 저장하는 전략을 채택했습니다. 추후 확장 시 주문 상세 테이블 분리, 상태 이력 테이블, 실시간 업데이트(SSE/WebSocket) 등을 추가할 수 있습니다.