import { Router } from 'express';
import { and, asc, count, desc, eq, ilike, inArray, or, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { orderItems, orders, user } from '../db/schema.js';

const router = Router();
const pageSize = 20;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const paymentStatuses = new Set(['pending', 'paid', 'checkout_failed']);
const fulfillmentStatuses = new Set(['new', 'confirmed', 'completed', 'cancelled']);

function readListQuery(query) {
  const search = typeof query.q === 'string' ? query.q.trim() : '';
  const paymentStatus = typeof query.paymentStatus === 'string' ? query.paymentStatus : '';
  const fulfillmentStatus = typeof query.fulfillmentStatus === 'string' ? query.fulfillmentStatus : '';
  const page = Number(query.page || 1);

  if (search.length > 200) return { error: 'Search must not exceed 200 characters.' };
  if (paymentStatus && !paymentStatuses.has(paymentStatus)) return { error: 'Invalid payment status.' };
  if (fulfillmentStatus && !fulfillmentStatuses.has(fulfillmentStatus)) return { error: 'Invalid fulfillment status.' };
  if (!Number.isInteger(page) || page < 1) return { error: 'Page must be a positive integer.' };

  return { value: { search, paymentStatus, fulfillmentStatus, page } };
}

function buildListConditions({ search, paymentStatus, fulfillmentStatus }) {
  const conditions = [];

  if (search) {
    const pattern = `%${search}%`;
    conditions.push(or(
      ilike(user.email, pattern),
      ilike(user.name, pattern),
      sql`${orders.id}::text ILIKE ${pattern}`,
    ));
  }

  if (paymentStatus) conditions.push(eq(orders.status, paymentStatus));
  if (fulfillmentStatus) conditions.push(eq(orders.fulfillmentStatus, fulfillmentStatus));

  return conditions.length > 0 ? and(...conditions) : undefined;
}

function groupItems(items) {
  return items.reduce((groupedItems, item) => {
    const orderGroup = groupedItems.get(item.orderId) || [];
    orderGroup.push(item);
    groupedItems.set(item.orderId, orderGroup);
    return groupedItems;
  }, new Map());
}

router.get('/', async (req, res) => {
  res.set('Cache-Control', 'no-store');

  const input = readListQuery(req.query);
  if (input.error) return res.status(400).json({ error: input.error });

  const { page } = input.value;
  const where = buildListConditions(input.value);

  try {
    const [{ value: total }] = await db
      .select({ value: count() })
      .from(orders)
      .innerJoin(user, eq(orders.userId, user.id))
      .where(where);

    const adminOrders = await db
      .select({
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
      })
      .from(orders)
      .innerJoin(user, eq(orders.userId, user.id))
      .where(where)
      .orderBy(desc(orders.createdAt), desc(orders.id))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    const items = adminOrders.length === 0 ? [] : await db
      .select({
        id: orderItems.id,
        orderId: orderItems.orderId,
        serviceName: orderItems.serviceName,
        unitAmount: orderItems.unitAmount,
        quantity: orderItems.quantity,
        lineTotal: orderItems.lineTotal,
      })
      .from(orderItems)
      .where(inArray(orderItems.orderId, adminOrders.map((order) => order.id)))
      .orderBy(asc(orderItems.createdAt), asc(orderItems.id));

    const itemsByOrder = groupItems(items);
    const responseOrders = adminOrders.map((order) => ({
      ...order,
      items: (itemsByOrder.get(order.id) || []).map(({ orderId, ...item }) => item),
    }));

    return res.json({
      orders: responseOrders,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    });
  } catch {
    console.error('Failed to retrieve admin orders.');
    return res.status(500).json({ error: 'Unable to load orders.' });
  }
});

router.get('/:orderId', async (req, res) => {
  res.set('Cache-Control', 'no-store');

  const { orderId } = req.params;
  if (!uuidPattern.test(orderId)) {
    return res.status(400).json({ error: 'Invalid order ID.' });
  }

  try {
    const [order] = await db
      .select({
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
      })
      .from(orders)
      .innerJoin(user, eq(orders.userId, user.id))
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) return res.status(404).json({ error: 'Order not found.' });

    const items = await db
      .select({
        id: orderItems.id,
        serviceName: orderItems.serviceName,
        unitAmount: orderItems.unitAmount,
        quantity: orderItems.quantity,
        lineTotal: orderItems.lineTotal,
      })
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id))
      .orderBy(asc(orderItems.createdAt), asc(orderItems.id));

    return res.json({ order: { ...order, items } });
  } catch {
    console.error('Failed to retrieve an admin order.');
    return res.status(500).json({ error: 'Unable to load the order.' });
  }
});

router.patch('/:orderId/status', async (req, res) => {
  res.set('Cache-Control', 'no-store');

  const { orderId } = req.params;
  if (!uuidPattern.test(orderId)) {
    return res.status(400).json({ error: 'Invalid order ID.' });
  }

  const fulfillmentStatus = typeof req.body?.fulfillmentStatus === 'string'
    ? req.body.fulfillmentStatus
    : '';

  if (!fulfillmentStatuses.has(fulfillmentStatus)) {
    return res.status(400).json({ error: 'Invalid fulfillment status.' });
  }

  try {
    const [existingOrder] = await db
      .select({ id: orders.id, status: orders.status })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!existingOrder) return res.status(404).json({ error: 'Order not found.' });
    if (existingOrder.status !== 'paid') {
      return res.status(409).json({ error: 'Only paid orders can change fulfillment status.' });
    }

    const now = new Date();
    const [updatedOrder] = await db
      .update(orders)
      .set({
        fulfillmentStatus,
        completedAt: fulfillmentStatus === 'completed' ? now : null,
        cancelledAt: fulfillmentStatus === 'cancelled' ? now : null,
      })
      .where(and(eq(orders.id, orderId), eq(orders.status, 'paid')))
      .returning({
        id: orders.id,
        status: orders.status,
        fulfillmentStatus: orders.fulfillmentStatus,
        completedAt: orders.completedAt,
        cancelledAt: orders.cancelledAt,
      });

    if (!updatedOrder) {
      return res.status(409).json({ error: 'The order changed before it could be updated.' });
    }

    return res.json({ order: updatedOrder });
  } catch {
    console.error('Failed to update an order fulfillment status.');
    return res.status(500).json({ error: 'Unable to update the order.' });
  }
});

export default router;
