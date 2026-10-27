import { and, eq, inArray } from 'drizzle-orm';
import { db } from '../db/index.js';
import { orders } from '../db/schema.js';
import { getStripeClient, getStripeWebhookSecret } from '../stripe.js';

function paymentIntentId(checkoutSession) {
  if (typeof checkoutSession.payment_intent === 'string') {
    return checkoutSession.payment_intent;
  }

  return checkoutSession.payment_intent?.id || null;
}

async function markCheckoutOrderPaid(checkoutSession) {
  const orderId = checkoutSession.metadata?.orderId;

  if (!orderId) {
    console.error('Paid Checkout Session is missing its order ID.');
    return;
  }

  const [order] = await db
    .select()
    .from(orders)
    .where(and(
      eq(orders.id, orderId),
      eq(orders.stripeCheckoutSessionId, checkoutSession.id),
    ))
    .limit(1);

  if (!order) {
    console.error('Paid Checkout Session does not match a stored order.');
    return;
  }

  if (checkoutSession.metadata?.userId !== order.userId) {
    throw new Error('Checkout Session user does not match the stored order.');
  }

  if (
    checkoutSession.payment_status !== 'paid'
    || checkoutSession.amount_total !== order.totalAmount
    || checkoutSession.currency !== order.currency
  ) {
    throw new Error('Checkout Session payment details do not match the stored order.');
  }

  if (order.status === 'paid') return;

  await db
    .update(orders)
    .set({
      status: 'paid',
      stripePaymentIntentId: paymentIntentId(checkoutSession),
      paidAt: new Date(),
    })
    .where(and(
      eq(orders.id, order.id),
      eq(orders.stripeCheckoutSessionId, checkoutSession.id),
      inArray(orders.status, ['pending', 'checkout_failed']),
    ));
}

export async function stripeWebhook(req, res) {
  const signature = req.get('stripe-signature');

  if (!signature) {
    return res.status(400).json({ error: 'Missing Stripe signature.' });
  }

  let event;

  try {
    event = getStripeClient().webhooks.constructEvent(
      req.body,
      signature,
      getStripeWebhookSecret(),
    );
  } catch {
    console.error('Rejected a Stripe webhook with an invalid signature.');
    return res.status(400).json({ error: 'Invalid Stripe signature.' });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      await markCheckoutOrderPaid(event.data.object);
    }

    return res.json({ received: true });
  } catch {
    console.error('Failed to process a verified Stripe webhook event.');
    return res.status(500).json({ error: 'Unable to process Stripe webhook.' });
  }
}
