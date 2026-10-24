import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { sql } from 'drizzle-orm';
import { auth } from './auth.js';
import { db } from './db/index.js';
import photosRouter from './routes/photos.js';

const app = express();
const port = Number(process.env.PORT || 3000);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535.');
}

app.disable('x-powered-by');
app.use(cors({
  origin: new URL(process.env.CLIENT_URL).origin,
  credentials: true,
}));

// Better Auth must receive the request body before express.json() parses it.
app.all('/api/auth/*splat', toNodeHandler(auth));

app.use(express.json({ limit: '100kb' }));
app.use('/api/photos', photosRouter);

app.get('/api/health', async (req, res) => {
  res.set('Cache-Control', 'no-store');

  try {
    await db.execute(sql`SELECT 1`);
    res.json({ status: 'ok', database: 'connected' });
  } catch {
    console.error('Database health check failed.');
    res.status(503).json({ status: 'error', database: 'unavailable' });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// Express requires all four parameters to recognize error middleware.
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON body.' });
  }

  if (error.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request body is too large.' });
  }

  console.error('An unexpected server error occurred.');
  res.status(500).json({ error: 'Internal server error.' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on http://localhost:${port}`);
});
