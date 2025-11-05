import { Router } from 'express';
import { z } from 'zod';
import { menus, orders, pushOrder, findOrder } from '../data/store.js';
import { db } from '../db.js';

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
router.get('/', async (req, res, next) => {
  const { status } = req.query;
  try {
    const p = db();
    if (!p) {
      const list = status ? orders.filter((o) => o.status === status) : orders;
      return res.json({ data: list });
    }
    const client = await p.connect();
    try {
      await client.query("SET timezone = 'Asia/Seoul'");
      let q = 'SELECT id, ordered_at AS "orderedAt", status, total_amount AS "totalAmount", items FROM orders';
      const params = [];
      if (status) {
        q += ' WHERE status=$1';
        params.push(status);
      }
      q += ' ORDER BY ordered_at DESC';
      const { rows } = await client.query(q, params);
      res.json({ data: rows });
    } finally {
      client.release();
    }
  } catch (e) { next(e); }
});

// GET /api/orders/:id
router.get('/:id', async (req, res, next) => {
  try {
    const p = db();
    if (!p) {
      const order = findOrder(req.params.id);
      if (!order) return res.status(404).json({ error: { message: 'Order not found' } });
      return res.json({ data: order });
    }
    const client = await p.connect();
    try {
      await client.query("SET timezone = 'Asia/Seoul'");
      const { rows } = await client.query('SELECT id, ordered_at AS "orderedAt", status, total_amount AS "totalAmount", items FROM orders WHERE id=$1', [req.params.id]);
      if (!rows.length) return res.status(404).json({ error: { message: 'Order not found' } });
      res.json({ data: rows[0] });
    } finally {
      client.release();
    }
  } catch (e) { next(e); }
});

// POST /api/orders
router.post('/', async (req, res, next) => {
  const parse = CreateOrderSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: { message: 'Invalid payload', detail: parse.error.flatten() } });
  }
  const { items } = parse.data;
  try {
    const p = db();
    if (!p) {
      // 인메모리 처리
      let total = 0; const lines = [];
      for (const it of items) {
        const menu = menus.find((m) => m.id === it.menuId);
        if (!menu) return res.status(404).json({ error: { message: `Menu not found: ${it.menuId}` } });
        if ((menu.stock || 0) < it.quantity) return res.status(409).json({ error: { message: `Out of stock: ${menu.name}` } });
        const optionIds = (it.options || []).map((o) => o.optionId);
        const { lineAmount, opts } = calcLine(menu, optionIds, it.quantity);
        total += lineAmount;
        lines.push({ menuId: menu.id, menuName: menu.name, unitPrice: menu.price, quantity: it.quantity, options: opts.map(o => ({ optionId: o.id, optionName: o.name, priceDelta: o.priceDelta })), lineAmount });
      }
      for (const it of items) {
        const menu = menus.find((m) => m.id === it.menuId);
        menu.stock = Math.max(0, (menu.stock || 0) - it.quantity);
      }
      const order = { id: `o-${Date.now()}`, orderedAt: new Date().toISOString(), status: 'PENDING', totalAmount: total, items: lines };
      pushOrder(order);
      return res.status(201).json({ data: order });
    }
    // DB 처리 (트랜잭션)
    const client = await p.connect();
    try {
      await client.query("SET timezone = 'Asia/Seoul'");
      await client.query('BEGIN');
      let total = 0; const lines = [];
      for (const it of items) {
        const { rows } = await client.query('SELECT id, name, price, stock FROM menus WHERE id=$1 FOR UPDATE', [it.menuId]);
        if (!rows.length) { await client.query('ROLLBACK'); return res.status(404).json({ error: { message: `Menu not found: ${it.menuId}` } }); }
        const menu = rows[0];
        if ((menu.stock || 0) < it.quantity) { await client.query('ROLLBACK'); return res.status(409).json({ error: { message: `Out of stock: ${menu.name}` } }); }
        const optIds = (it.options || []).map(o => o.optionId);
        const { rows: optRows } = optIds.length ? await client.query('SELECT id, name, price_delta AS "priceDelta" FROM options WHERE id = ANY($1)', [optIds]) : { rows: [] };
        const optMap = new Map(optRows.map(o => [o.id, o]));
        const opts = optIds.map(id => optMap.get(id)).filter(Boolean);
        const optDelta = opts.reduce((s, o) => s + (o.priceDelta || 0), 0);
        const unit = Number(menu.price) + optDelta;
        const lineAmount = unit * it.quantity;
        total += lineAmount;
        lines.push({ menuId: menu.id, menuName: menu.name, unitPrice: Number(menu.price), quantity: it.quantity, options: opts.map(o => ({ optionId: o.id, optionName: o.name, priceDelta: o.priceDelta })), lineAmount });
        await client.query('UPDATE menus SET stock = stock - $2, updated_at = NOW() WHERE id=$1', [menu.id, it.quantity]);
      }
      const orderId = `o-${Date.now()}`;
      await client.query('INSERT INTO orders(id, ordered_at, status, total_amount, items) VALUES($1, NOW(), $2, $3, $4)', [orderId, 'PENDING', total, JSON.stringify(lines)]);
      await client.query('COMMIT');
      return res.status(201).json({ data: { id: orderId, orderedAt: new Date().toISOString(), status: 'PENDING', totalAmount: total, items: lines } });
    } catch (e) {
      try { await client.query('ROLLBACK'); } catch {}
      throw e;
    } finally { if (client) client.release(); }
  } catch (e) { next(e); }
});

// PATCH /api/orders/:id/status
router.patch('/:id/status', async (req, res, next) => {
  try {
    const p = db();
    if (!p) {
      const order = findOrder(req.params.id);
      if (!order) return res.status(404).json({ error: { message: 'Order not found' } });
      const next = req.body?.status;
      const allowed = { PENDING: ['IN_PROGRESS'], IN_PROGRESS: ['COMPLETED'], COMPLETED: [] };
      if (!allowed[order.status]?.includes(next)) return res.status(400).json({ error: { message: `Invalid transition ${order.status} -> ${next}` } });
      order.status = next; order.updatedAt = new Date().toISOString();
      return res.json({ data: { id: order.id, status: order.status, updatedAt: order.updatedAt } });
    }
    const client = await p.connect();
    try {
      await client.query("SET timezone = 'Asia/Seoul'");
      const { rows } = await client.query('SELECT id, status FROM orders WHERE id=$1', [req.params.id]);
      if (!rows.length) return res.status(404).json({ error: { message: 'Order not found' } });
      const cur = rows[0];
      const next = req.body?.status;
      const allowed = { PENDING: ['IN_PROGRESS'], IN_PROGRESS: ['COMPLETED'], COMPLETED: [] };
      if (!allowed[cur.status]?.includes(next)) return res.status(400).json({ error: { message: `Invalid transition ${cur.status} -> ${next}` } });
      const { rows: upd } = await client.query('UPDATE orders SET status=$2, updated_at=NOW() WHERE id=$1 RETURNING updated_at AS "updatedAt"', [req.params.id, next]);
      res.json({ data: { id: req.params.id, status: next, updatedAt: upd[0].updatedAt } });
    } finally { client.release(); }
  } catch (e) { next(e); }
});

export default router;


