import { Router } from 'express';
import { asc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { photos } from '../db/schema.js';

const router = Router();

// Mount this router at /api/photos in the Express app.
router.get('/', async (req, res) => {
  try {
    const photoList = await db
      .select()
      .from(photos)
      .orderBy(asc(photos.sortOrder), asc(photos.id));

    res.json({ photos: photoList });
  } catch {
    // Keep database details and credentials out of the response and logs.
    console.error('Failed to fetch gallery photos.');
    res.status(500).json({ error: 'Unable to load photos. Please try again later.' });
  }
});

export default router;
