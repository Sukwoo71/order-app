import { Pool } from 'pg';

let pool = null;

function getPool() {
  if (pool) return pool;
  const { DB_URL, DB_USERNAME, DB_PASSWORD } = process.env;
  if (!DB_URL) return null;
  try {
    const raw = DB_URL.startsWith('jdbc:') ? DB_URL.replace('jdbc:', '') : DB_URL;
    const u = new URL(raw);
    pool = new Pool({
      host: u.hostname,
      port: Number(u.port || 5432),
      database: (u.pathname || '').replace('/', ''),
      user: DB_USERNAME || u.username || undefined,
      password: DB_PASSWORD || u.password || undefined
    });
    return pool;
  } catch (e) {
    console.error('[db] invalid DB_URL', e);
    return null;
  }
}

export async function initDb() {
  const p = getPool();
  if (!p) return false;
  let client;
  try {
    client = await p.connect();
    await client.query('BEGIN');
    await client.query(`CREATE TABLE IF NOT EXISTS menus (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price INTEGER NOT NULL,
      image_url TEXT,
      stock INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`);
    await client.query(`CREATE TABLE IF NOT EXISTS options (
      id TEXT PRIMARY KEY,
      menu_id TEXT NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      price_delta INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`);
    await client.query(`CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      ordered_at TIMESTAMP NOT NULL DEFAULT NOW(),
      status TEXT NOT NULL,
      total_amount INTEGER NOT NULL,
      items JSONB NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`);
    await client.query('COMMIT');
    return true;
  } catch (e) {
    try {
      if (client) await client.query('ROLLBACK');
    } catch {}
    console.error('[db] init failed', e.message || e);
    return false;
  } finally {
    if (client) client.release();
  }
}

export async function seedFromMemory(menusMem) {
  const p = getPool();
  if (!p) return false;
  const client = await p.connect();
  try {
    const { rows } = await client.query('SELECT COUNT(*)::int AS cnt FROM menus');
    if (rows[0].cnt > 0) return false;
    await client.query('BEGIN');
    for (const m of menusMem) {
      await client.query(
        `INSERT INTO menus(id,name,description,price,image_url,stock)
         VALUES($1,$2,$3,$4,$5,$6)`,
        [m.id, m.name, m.description || null, m.price, m.imageUrl || null, m.stock || 0]
      );
      for (const o of m.options || []) {
        await client.query(
          `INSERT INTO options(id,menu_id,name,price_delta)
           VALUES($1,$2,$3,$4)`,
          [o.id, m.id, o.name, o.priceDelta || 0]
        );
      }
    }
    await client.query('COMMIT');
    return true;
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('[db] seed failed', e);
    return false;
  } finally {
    client.release();
  }
}

export function db() {
  return getPool();
}


