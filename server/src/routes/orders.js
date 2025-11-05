import { Router } from 'express';
import { z } from 'zod';
import { menus, orders, pushOrder, findOrder } from '../data/store.js';

const router = Router();

const OrderItemSchema = z.object({
  menuId: z.string(),
  quantity: z.number().int().positive(),
  options: z.array(z.object({ optionId: z.string() })).optional().default([])
});

const CreateOrderSchema = z.object({
  items: z.array(OrderItemSchema).nonempty()
});

// Helpers
function calcLine(menu, optionIds, quantity) {
  const base = menu.price;
  const opts = (menu.options || []).filter((o) => optionIds.includes(o.id));
  const optDelta = opts.reduce((sum, o) => sum + (o.priceDelta || 0), 0);
  const unit = base + optDelta;
  return { unit, lineAmount: unit * quantity, opts };
}

// GET /api/orders
router.get('/', (req, res) => {
  const { status } = req.query;
  const list = status ? orders.filter((o) => o.status === status) : orders;
  res.json({ data: list });
});

// GET /api/orders/:id
router.get('/:id', (req, res) => {
  const order = findOrder(req.params.id);
  if (!order) return res.status(404).json({ error: { message: 'Order not found' } });
  res.json({ data: order });
});

// POST /api/orders
router.post('/', (req, res) => {
  const parse = CreateOrderSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: { message: 'Invalid payload', detail: parse.error.flatten() } });
  }
  const { items } = parse.data;

  // 재고 확인 및 금액 계산
  let total = 0;
  const lines = [];
  for (const it of items) {
    const menu = menus.find((m) => m.id === it.menuId);
    if (!menu) return res.status(404).json({ error: { message: `Menu not found: ${it.menuId}` } });
    if ((menu.stock || 0) < it.quantity) {
      return res.status(409).json({ error: { message: `Out of stock: ${menu.name}` } });
    }
    const optionIds = (it.options || []).map((o) => o.optionId);
    const { unit, lineAmount, opts } = calcLine(menu, optionIds, it.quantity);
    total += lineAmount;
    lines.push({
      menuId: menu.id,
      menuName: menu.name,
      unitPrice: menu.price,
      quantity: it.quantity,
      options: opts.map((o) => ({ optionId: o.id, optionName: o.name, priceDelta: o.priceDelta })),
      lineAmount
    });
  }

  // 재고 차감
  for (const it of items) {
    const menu = menus.find((m) => m.id === it.menuId);
    menu.stock = Math.max(0, (menu.stock || 0) - it.quantity);
  }

  const order = {
    id: `o-${Date.now()}`,
    orderedAt: new Date().toISOString(),
    status: 'PENDING',
    totalAmount: total,
    items: lines
  };
  pushOrder(order);
  res.status(201).json({ data: order });
});

// PATCH /api/orders/:id/status
router.patch('/:id/status', (req, res) => {
  const order = findOrder(req.params.id);
  if (!order) return res.status(404).json({ error: { message: 'Order not found' } });
  const next = req.body?.status;
  const allowed = {
    PENDING: ['IN_PROGRESS'],
    IN_PROGRESS: ['COMPLETED'],
    COMPLETED: []
  };
  if (!allowed[order.status]?.includes(next)) {
    return res.status(400).json({ error: { message: `Invalid transition ${order.status} -> ${next}` } });
  }
  order.status = next;
  order.updatedAt = new Date().toISOString();
  res.json({ data: { id: order.id, status: order.status, updatedAt: order.updatedAt } });
});

export default router;


