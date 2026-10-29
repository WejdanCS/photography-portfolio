import { z } from 'zod';
import { AppError } from '../errors/app-error.js';

export const uuidSchema = z.string().uuid({ version: 'v4', message: 'Invalid order ID.' });

export function parseInput(schema, input) {
  const result = schema.safeParse(input);
  if (result.success) return result.data;

  throw new AppError(400, 'VALIDATION_ERROR', 'Request validation failed.', result.error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  })));
}
