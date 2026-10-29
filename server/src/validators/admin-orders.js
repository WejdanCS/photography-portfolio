import { z } from 'zod';
import { parseInput, uuidSchema } from './common.js';

export const paymentStatuses = ['pending', 'paid', 'checkout_failed'];
export const fulfillmentStatuses = ['new', 'confirmed', 'completed', 'cancelled'];

const listSchema = z.object({
  q: z.string().trim().max(200).optional().default(''),
  paymentStatus: z.enum(paymentStatuses).or(z.literal('')).optional().default(''),
  fulfillmentStatus: z.enum(fulfillmentStatuses).or(z.literal('')).optional().default(''),
  page: z.coerce.number().int().positive().optional().default(1),
});

const statusSchema = z.object({ fulfillmentStatus: z.enum(fulfillmentStatuses) }).strict();

export const validateAdminOrderList = (query) => parseInput(listSchema, query);
export const validateFulfillmentStatus = (body) => parseInput(statusSchema, body);
export const validateOrderId = (params) => parseInput(z.object({ orderId: uuidSchema }), params).orderId;
