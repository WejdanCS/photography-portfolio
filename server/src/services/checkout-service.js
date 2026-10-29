import { AppError } from '../errors/app-error.js';

function successUrl(url, orderId) {
  const result = new URL(url);
  result.searchParams.set('order_id', orderId);
  return `${result.toString()}&session_id={CHECKOUT_SESSION_ID}`;
}

export function createCheckoutService({ orderRepository, stripe, checkoutUrls, getCheckoutUrls }) {
  return async function startCheckout({ user, input }) {
    const service = await orderRepository.findActiveService(input.serviceId);
    if (!service) throw new AppError(404, 'SERVICE_NOT_FOUND', 'Photography session not found.');

    let orderId;
    let checkoutSession;
    try {
      const urls = checkoutUrls || getCheckoutUrls();
      const order = await orderRepository.createPendingOrder({
        userId: user.id,
        service,
        preferredDate: input.preferredDate,
        projectMessage: input.projectMessage,
      });
      orderId = order.id;
      checkoutSession = await stripe.checkout.sessions.create({
        mode: 'payment',
        customer_email: user.email,
        client_reference_id: orderId,
        metadata: { orderId, userId: user.id },
        payment_intent_data: { metadata: { orderId, userId: user.id } },
        line_items: [{
          quantity: 1,
          price_data: {
            currency: service.currency,
            unit_amount: service.unitAmount,
            product_data: { name: `${service.name} photography session`, description: service.description },
          },
        }],
        success_url: successUrl(urls.successUrl, orderId),
        cancel_url: urls.cancelUrl.toString(),
        submit_type: 'book',
      }, { idempotencyKey: `checkout-order-${orderId}` });
      if (!checkoutSession.url) throw new Error('Stripe did not return a hosted Checkout URL.');
      await orderRepository.setCheckoutSession(orderId, checkoutSession.id);
      return { checkoutUrl: checkoutSession.url };
    } catch (error) {
      if (checkoutSession?.id) {
        try { await stripe.checkout.sessions.expire(checkoutSession.id); } catch { console.error('Failed to expire an incomplete Stripe Checkout Session.'); }
      }
      if (orderId) {
        try { await orderRepository.markCheckoutFailed(orderId); } catch { console.error('Failed to record the Checkout error on the order.'); }
      }
      console.error('Failed to create a Stripe Checkout Session.');
      throw new AppError(502, 'CHECKOUT_UNAVAILABLE', 'Unable to start checkout. Please try again.');
    }
  };
}
