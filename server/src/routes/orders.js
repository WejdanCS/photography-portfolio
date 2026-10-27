import { Router } from 'express';
import { asc, and, eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { orderItems, orders } from '../db/schema.js';

const router = Router();
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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
        totalAmount: orders.totalAmount,
        currency: orders.currency,
        preferredMonth: orders.preferredMonth,
        projectMessage: orders.projectMessage,
        paidAt: orders.paidAt,
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
