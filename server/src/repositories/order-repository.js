import { and, asc, desc, eq, inArray } from 'drizzle-orm';
import { orderItems, orders, services } from '../db/schema.js';

const orderFields = {
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
};

const itemFields = {
  id: orderItems.id,
  orderId: orderItems.orderId,
  serviceName: orderItems.serviceName,
  unitAmount: orderItems.unitAmount,
  quantity: orderItems.quantity,
  lineTotal: orderItems.lineTotal,
};

async function attachItems(db, orderList) {
  if (orderList.length === 0) return [];
  const items = await db.select(itemFields).from(orderItems)
    .where(inArray(orderItems.orderId, orderList.map((order) => order.id)))
    .orderBy(asc(orderItems.createdAt), asc(orderItems.id));
  const grouped = items.reduce((result, item) => {
    const group = result.get(item.orderId) || [];
    group.push(item);
    result.set(item.orderId, group);
    return result;
  }, new Map());
  return orderList.map((order) => ({
    ...order,
    items: (grouped.get(order.id) || []).map(({ orderId, ...item }) => item),
  }));
}

export function createOrderRepository(db) {
  return {
    async findActiveService(serviceId) {
      const [service] = await db.select().from(services)
        .where(and(eq(services.id, serviceId), eq(services.isActive, true))).limit(1);
      return service;
    },
    async createPendingOrder({ userId, service, preferredDate, projectMessage }) {
      return db.transaction(async (transaction) => {
        const [order] = await transaction.insert(orders).values({
          userId,
          totalAmount: service.unitAmount,
          currency: service.currency,
          preferredMonth: preferredDate,
          projectMessage,
        }).returning({ id: orders.id });
        await transaction.insert(orderItems).values({
          orderId: order.id,
          serviceId: service.id,
          serviceName: service.name,
          unitAmount: service.unitAmount,
          quantity: 1,
          lineTotal: service.unitAmount,
        });
        return order;
      });
    },
    setCheckoutSession(orderId, sessionId) {
      return db.update(orders).set({ stripeCheckoutSessionId: sessionId }).where(eq(orders.id, orderId));
    },
    markCheckoutFailed(orderId) {
      return db.update(orders).set({ status: 'checkout_failed' })
        .where(and(eq(orders.id, orderId), eq(orders.status, 'pending')));
    },
    async listPaidForUser(userId) {
      const rows = await db.select(orderFields).from(orders)
        .where(and(eq(orders.userId, userId), eq(orders.status, 'paid')))
        .orderBy(desc(orders.createdAt), desc(orders.id));
      return attachItems(db, rows);
    },
    async findForUser(orderId, userId) {
      const [order] = await db.select(orderFields).from(orders)
        .where(and(eq(orders.id, orderId), eq(orders.userId, userId))).limit(1);
      if (!order) return null;
      const [result] = await attachItems(db, [order]);
      return result;
    },
    async findCheckoutOrder(orderId, checkoutSessionId) {
      const [order] = await db.select().from(orders).where(and(
        eq(orders.id, orderId),
        eq(orders.stripeCheckoutSessionId, checkoutSessionId),
      )).limit(1);
      return order;
    },
    markPaid({ orderId, checkoutSessionId, paymentIntentId, paidAt }) {
      return db.update(orders).set({
        status: 'paid', stripePaymentIntentId: paymentIntentId, paidAt,
      }).where(and(
        eq(orders.id, orderId),
        eq(orders.stripeCheckoutSessionId, checkoutSessionId),
        inArray(orders.status, ['pending', 'checkout_failed']),
      ));
    },
  };
}
