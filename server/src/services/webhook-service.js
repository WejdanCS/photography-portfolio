function paymentIntentId(session) {
  return typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id || null;
}

export function createWebhookService(repository) {
  return async function processStripeEvent(event) {
    if (event.type !== 'checkout.session.completed') return;
    const session = event.data.object;
    const orderId = session.metadata?.orderId;
    if (!orderId) throw new Error('Paid Checkout Session is missing its order ID.');
    const order = await repository.findCheckoutOrder(orderId, session.id);
    if (!order) throw new Error('Paid Checkout Session does not match a stored order.');
    if (session.metadata?.userId !== order.userId) throw new Error('Checkout Session user does not match the stored order.');
    if (session.payment_status !== 'paid' || session.amount_total !== order.totalAmount || session.currency !== order.currency) {
      throw new Error('Checkout Session payment details do not match the stored order.');
    }
    if (order.status === 'paid') return;
    await repository.markPaid({
      orderId: order.id,
      checkoutSessionId: session.id,
      paymentIntentId: paymentIntentId(session),
      paidAt: new Date(),
    });
  };
}
