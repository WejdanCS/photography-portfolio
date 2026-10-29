import { z } from 'zod';
import { AppError } from '../errors/app-error.js';
import { parseInput } from './common.js';

const datePattern = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

function isCalendarDate(value) {
  if (!datePattern.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

const checkoutSchema = z.object({
  serviceId: z.string().trim().min(1, 'Choose a valid photography session.').max(100),
  preferredDate: z.string().trim().refine((value) => !value || isCalendarDate(value), {
    message: 'Preferred date must be a valid date in YYYY-MM-DD format.',
  }).optional().default(''),
  message: z.string().trim().min(1, 'Project message is required.').max(2000),
}).strict();

export function todayInBookingTimeZone(timeZone = process.env.BOOKING_TIME_ZONE || 'Asia/Riyadh') {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = Object.fromEntries(formatter.formatToParts(new Date()).map(({ type, value }) => [type, value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function validateCheckoutInput(body, today = todayInBookingTimeZone()) {
  const value = parseInput(checkoutSchema, body);
  if (value.preferredDate && value.preferredDate <= today) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Request validation failed.', [{
      path: 'preferredDate',
      message: 'Preferred date must be after today.',
    }]);
  }
  return {
    serviceId: value.serviceId,
    preferredDate: value.preferredDate || null,
    projectMessage: value.message,
  };
}
