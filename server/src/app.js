import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import menusRouter from './routes/menus.js';
import ordersRouter from './routes/orders.js';
import healthRouter from './routes/health.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/health', healthRouter);
app.use('/api/menus', menusRouter);
app.use('/api/orders', ordersRouter);

// 공통 에러 핸들러
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[error]', err);
  const status = err.status || 500;
  res.status(status).json({ error: { message: err.message || 'Internal Server Error' } });
});

export default app;


