import { and, asc, count, desc, eq, ilike, inArray, or, sql } from 'drizzle-orm';
import { orderItems, orders, user } from '../db/schema.js';

const pageSize = 20;
const fields = {
  id: orders.id,
  status: orders.status,
  fulfillmentStatus: orders.fulfillmentStatus,
  totalAmount: orders.totalAmount,
  currency: orders.currency,
  preferredMonth: orders.preferredMonth,
  projectMessage: orders.projectMessage,
  paidAt: orders.paidAt,
  completedAt: orders.completedAt,
  cancelledAt: orders.cancelledAt,
  createdAt: orders.createdAt,
  customerId: user.id,
  customerName: user.name,
  customerEmail: user.email,
};

function buildWhere({ q, paymentStatus, fulfillmentStatus }) {
  const conditions = [];
  if (q) {
    const pattern = `%${q}%`;
    conditions.push(or(ilike(user.email, pattern), ilike(user.name, pattern), sql`${orders.id}::text ILIKE ${pattern}`));
  }
  if (paymentStatus) conditions.push(eq(orders.status, paymentStatus));
  if (fulfillmentStatus) conditions.push(eq(orders.fulfillmentStatus, fulfillmentStatus));
  return conditions.length ? and(...conditions) : undefined;
}

async function listItems(db, orderIds) {
  if (!orderIds.length) return new Map();
  const items = await db.select({
    id: orderItems.id, orderId: orderItems.orderId, serviceName: orderItems.serviceName,
    unitAmount: orderItems.unitAmount, quantity: orderItems.quantity, lineTotal: orderItems.lineTotal,
  }).from(orderItems).where(inArray(orderItems.orderId, orderIds))
    .orderBy(asc(orderItems.createdAt), asc(orderItems.id));
  return items.reduce((result, item) => {
    const group = result.get(item.orderId) || [];
    group.push(item);
    result.set(item.orderId, group);
    return result;
  }, new Map());
}

export function createAdminOrderRepository(db) {
  return {
    async list(filters) {
      const where = buildWhere(filters);
      const [{ value: total }] = await db.select({ value: count() }).from(orders)
        .innerJoin(user, eq(orders.userId, user.id)).where(where);
      const rows = await db.select(fields).from(orders).innerJoin(user, eq(orders.userId, user.id))
        .where(where).orderBy(desc(orders.createdAt), desc(orders.id))
        .limit(pageSize).offset((filters.page - 1) * pageSize);
      const grouped = await listItems(db, rows.map((order) => order.id));
      return {
        orders: rows.map((order) => ({
          ...order,
          items: (grouped.get(order.id) || []).map(({ orderId, ...item }) => item),
        })),
        pagination: { page: filters.page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
      };
    },
    async find(orderId) {
      const [order] = await db.select(fields).from(orders).innerJoin(user, eq(orders.userId, user.id))
        .where(eq(orders.id, orderId)).limit(1);
      if (!order) return null;
      const grouped = await listItems(db, [order.id]);
      return { ...order, items: (grouped.get(order.id) || []).map(({ orderId, ...item }) => item) };
    },
    async findStatus(orderId) {
      const [order] = await db.select({ id: orders.id, status: orders.status }).from(orders)
        .where(eq(orders.id, orderId)).limit(1);
      return order;
    },
    async updateFulfillment(orderId, fulfillmentStatus, now) {
      const [order] = await db.update(orders).set({
        fulfillmentStatus,
        completedAt: fulfillmentStatus === 'completed' ? now : null,
        cancelledAt: fulfillmentStatus === 'cancelled' ? now : null,
      }).where(and(eq(orders.id, orderId), eq(orders.status, 'paid'))).returning({
        id: orders.id, status: orders.status, fulfillmentStatus: orders.fulfillmentStatus,
        completedAt: orders.completedAt, cancelledAt: orders.cancelledAt,
      });
      return order;
    },
  };
}
