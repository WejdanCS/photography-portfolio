import { AppError } from '../errors/app-error.js';

export function createHealthService(repository) {
  return async function checkHealth() {
    try {
      await repository.checkDatabase();
      return { status: 'ok', database: 'connected' };
    } catch {
      console.error('Database health check failed.');
      throw new AppError(503, 'DATABASE_UNAVAILABLE', 'Database is unavailable.');
    }
  };
}
