import { Router } from 'express';
import { menus } from '../data/store.js';
import { db } from '../db.js';

const router = Router();

// GET /api/menus?includeOptions=true
router.get('/', async (req, res, next) => {
  const includeOptions = req.query.includeOptions !== 'false';
  try {
    const p = db();
    if (!p) {
      const data = menus.map((m) => ({
        id: m.id,
        name: m.name,
        description: m.description,
        price: m.price,
        imageUrl: m.imageUrl,
        stock: m.stock,
        ...(includeOptions ? { options: m.options } : {})
      }));
      return res.json({ data });
    }
    const client = await p.connect();
    try {
      const { rows: menuRows } = await client.query(
        'SELECT id, name, description, price, image_url AS "imageUrl", stock FROM menus ORDER BY name'
      );
      if (!includeOptions) return res.json({ data: menuRows });
      const { rows: optRows } = await client.query(
        'SELECT id, menu_id AS "menuId", name, price_delta AS "priceDelta" FROM options'
      );
      const byMenu = optRows.reduce((acc, o) => {
        (acc[o.menuId] ||= []).push(o);
        return acc;
      }, {});
      const data = menuRows.map((m) => ({ ...m, options: byMenu[m.id] || [] }));
      res.json({ data });
    } finally {
      client.release();
    }
  } catch (e) {
    next(e);
  }
});

// PATCH /api/menus/:id/stock { delta }
router.patch('/:id/stock', async (req, res, next) => {
  const { id } = req.params;
  const { delta } = req.body || {};
  const d = Number(delta);
  if (!Number.isFinite(d)) return res.status(400).json({ error: { message: 'delta must be a number' } });
  try {
    const p = db();
    if (!p) {
      const menu = menus.find((m) => m.id === id);
      if (!menu) return res.status(404).json({ error: { message: 'Menu not found' } });
      menu.stock = Math.max(0, (menu.stock || 0) + d);
      return res.json({ data: { id: menu.id, stock: menu.stock } });
    }
    const { rows } = await p.query('UPDATE menus SET stock = GREATEST(0, stock + $2) WHERE id=$1 RETURNING stock', [id, d]);
    if (!rows.length) return res.status(404).json({ error: { message: 'Menu not found' } });
    res.json({ data: { id, stock: rows[0].stock } });
  } catch (e) {
    next(e);
  }
});

export default router;


