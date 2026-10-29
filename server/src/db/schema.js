import { sql } from 'drizzle-orm';
import { boolean, check, index, integer, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

export const userRole = pgEnum('user_role', [
  'user',
  'admin',
]);

// Better Auth manages users, credentials and persistent sessions.
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  role: userRole('role').default('user').notNull(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
});


export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
}, (table) => [index('session_user_id_idx').on(table.userId)]);

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  // Better Auth stores a password hash here, never a plain-text password.
  password: text('password'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [index('account_user_id_idx').on(table.userId)]);

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [index('verification_identifier_idx').on(table.identifier)]);

// Keep the existing gallery IDs and field names for the seed and React UI.
export const photos = pgTable('photos', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  src: text('src').notNull(),
  alt: text('alt').notNull(),
  width: integer('width').notNull(),
  height: integer('height').notNull(),
  aspectClass: text('aspect_class').notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
});

// Prices are stored in the currency's smallest unit (for example, USD cents).
export const services = pgTable('services', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  unitAmount: integer('unit_amount').notNull(),
  currency: text('currency').default('usd').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  check('services_unit_amount_positive', sql`${table.unitAmount} > 0`),
  check('services_currency_format', sql`${table.currency} ~ '^[a-z]{3}$'`),
]);

export const orderStatus = pgEnum('order_status', [
  'pending',
  'paid',
  'checkout_failed',
]);

export const orderFulfillmentStatus = pgEnum('order_fulfillment_status', [
  'new',
  'confirmed',
  'completed',
  'cancelled',
]);

export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'restrict' }),
  status: orderStatus('status').default('pending').notNull(),
  fulfillmentStatus: orderFulfillmentStatus('fulfillment_status').default('new').notNull(),
  totalAmount: integer('total_amount').notNull(),
  currency: text('currency').notNull(),
  preferredMonth: text('preferred_month'),
  projectMessage: text('project_message').notNull(),
  stripeCheckoutSessionId: text('stripe_checkout_session_id'),
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  paidAt: timestamp('paid_at'),
  completedAt: timestamp('completed_at'),
  cancelledAt: timestamp('cancelled_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index('orders_user_id_idx').on(table.userId),
  index('orders_status_idx').on(table.status),
  index('orders_fulfillment_status_idx').on(table.fulfillmentStatus),
  uniqueIndex('orders_stripe_checkout_session_id_idx').on(table.stripeCheckoutSessionId),
  uniqueIndex('orders_stripe_payment_intent_id_idx').on(table.stripePaymentIntentId),
  check('orders_total_amount_positive', sql`${table.totalAmount} > 0`),
  check('orders_currency_format', sql`${table.currency} ~ '^[a-z]{3}$'`),
]);

export const orderItems = pgTable('order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  serviceId: text('service_id').notNull().references(() => services.id, { onDelete: 'restrict' }),
  serviceName: text('service_name').notNull(),
  unitAmount: integer('unit_amount').notNull(),
  quantity: integer('quantity').default(1).notNull(),
  lineTotal: integer('line_total').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('order_items_order_id_idx').on(table.orderId),
  check('order_items_unit_amount_positive', sql`${table.unitAmount} > 0`),
  check('order_items_quantity_positive', sql`${table.quantity} > 0`),
  check('order_items_line_total_positive', sql`${table.lineTotal} > 0`),
]);
