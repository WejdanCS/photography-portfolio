import { Router } from 'express';
import { asc, eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { services } from '../db/schema.js';

const router = Router();

router.get('/', async (req, res) => {
  res.set('Cache-Control', 'no-store');

  try {
    const serviceList = await db
      .select({
        id: services.id,
        name: services.name,
        description: services.description,
        unitAmount: services.unitAmount,
        currency: services.currency,
      })
      .from(services)
      .where(eq(services.isActive, true))
      .orderBy(asc(services.sortOrder), asc(services.id));

    return res.json({ services: serviceList });
  } catch {
    console.error('Failed to fetch photography services.');
    return res.status(500).json({ error: 'Unable to load photography sessions.' });
  }
});

export default router;
