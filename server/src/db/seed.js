import { db } from './index.js';
import { photos } from './schema.js';
import photosData from './photos.data.js';

try {
  // Insert missing photos; existing IDs are left unchanged on repeated runs.
  const insertedPhotos = await db
    .insert(photos)
    .values(photosData)
    .onConflictDoNothing({ target: photos.id })
    .returning({ id: photos.id });

  console.log(`Seed completed: ${insertedPhotos.length} photos added, ${photosData.length - insertedPhotos.length} already exist.`);
} catch {
  // Avoid logging connection details or credentials from database errors.
  console.error('Seed failed. Check the database connection and make sure the photos table exists.');
  process.exitCode = 1;
} finally {
  // Close the connection pool so the seed command can exit normally.
  try {
    await db.$client.end();
  } catch {
    console.error('Failed to close the database connection.');
    process.exitCode = 1;
  }
}
