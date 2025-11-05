import 'dotenv/config';
import app from './app.js';
import { initDb, seedFromMemory } from './db.js';
import { menus as memMenus } from './data/store.js';

const PORT = process.env.PORT || 4000;

(async () => {
  const ok = await initDb();
  if (ok) {
    await seedFromMemory(memMenus);
  }
  app.listen(PORT, () => {
    console.log(`[server] listening on http://localhost:${PORT}`);
  });
})();


