import { sql } from 'drizzle-orm';

export function createSystemRepository(db) {
  return { checkDatabase: () => db.execute(sql`SELECT 1`) };
}
