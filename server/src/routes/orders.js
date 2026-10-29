import { Router } from 'express';
import { asc, and, desc, eq, inArray } from 'drizzle-orm';
import { db } from '../db/index.js';
import { orderItems, orders } from '../db/schema.js';

const router = Router();
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

router.get('/', async (req, res) => {
  res.set('Cache-Control', 'no-store');

  try {
    const userOrders = await db
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
      })
      .from(orders)
      .where(and(
        eq(orders.userId, req.auth.user.id),
        eq(orders.status, 'paid'),
      ))
      .orderBy(desc(orders.createdAt), desc(orders.id));

    if (userOrders.length === 0) {
      return res.json({ orders: [] });
    }

    const items = await db
      .select({
        id: orderItems.id,
        orderId: orderItems.orderId,
        serviceName: orderItems.serviceName,
        unitAmount: orderItems.unitAmount,
        quantity: orderItems.quantity,
        lineTotal: orderItems.lineTotal,
      })
      .from(orderItems)
      .where(inArray(orderItems.orderId, userOrders.map((order) => order.id)))
      .orderBy(asc(orderItems.createdAt), asc(orderItems.id));

    const itemsByOrder = items.reduce((groupedItems, item) => {
      const orderGroup = groupedItems.get(item.orderId) || [];
      orderGroup.push(item);
      groupedItems.set(item.orderId, orderGroup);
      return groupedItems;
    }, new Map());
    const responseOrders = userOrders.map((order) => ({
      ...order,
      items: (itemsByOrder.get(order.id) || []).map(({ orderId, ...item }) => item),
    }));

    return res.json({ orders: responseOrders });
  } catch {
    console.error('Failed to retrieve user orders.');
    return res.status(500).json({ error: 'Unable to load your orders.' });
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
      })
      .from(orders)
      .where(and(
        eq(orders.id, orderId),
        eq(orders.userId, req.auth.user.id),
      ))
      .limit(1);

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

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
    console.error('Failed to retrieve an order.');
    return res.status(500).json({ error: 'Unable to load the order.' });
  }
});

export default router;
