import { db } from './index.js';
import { photos, services } from './schema.js';
import photosData from './photos.data.js';
import servicesData from './services.data.js';

try {
  // Insert missing photos; existing IDs are left unchanged on repeated runs.
  const insertedPhotos = await db
    .insert(photos)
    .values(photosData)
    .onConflictDoNothing({ target: photos.id })
    .returning({ id: photos.id });

  const insertedServices = await db
    .insert(services)
    .values(servicesData)
    .onConflictDoNothing({ target: services.id })
    .returning({ id: services.id });

  console.log(`Photo seed: ${insertedPhotos.length} added, ${photosData.length - insertedPhotos.length} already exist.`);
  console.log(`Service seed: ${insertedServices.length} added, ${servicesData.length - insertedServices.length} already exist.`);
} catch {
  // Avoid logging connection details or credentials from database errors.
  console.error('Seed failed. Check the database connection and make sure the schema is up to date.');
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
