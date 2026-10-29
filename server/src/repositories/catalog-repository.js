import { asc, eq } from 'drizzle-orm';
import { photos, services } from '../db/schema.js';

export function createCatalogRepository(db) {
  return {
    listPhotos() {
      return db.select().from(photos).orderBy(asc(photos.sortOrder), asc(photos.id));
    },
    listActiveServices() {
      return db.select({
        id: services.id,
        name: services.name,
        description: services.description,
        unitAmount: services.unitAmount,
        currency: services.currency,
      }).from(services).where(eq(services.isActive, true)).orderBy(asc(services.sortOrder), asc(services.id));
    },
  };
}
