import assert from 'node:assert/strict';
import test from 'node:test';
import { createCheckoutService } from '../src/services/checkout-service.js';
import { createAdminOrderService } from '../src/services/order-service.js';
import { createWebhookService } from '../src/services/webhook-service.js';

const service = { id: 'portrait', name: 'Portrait', description: 'Portrait session', unitAmount: 15000, currency: 'usd' };

test('checkout service creates a server-priced session and stores its ID', async () => {
  const calls = [];
  const repository = {
    findActiveService: async () => service,
    createPendingOrder: async (value) => { calls.push(['create', value]); return { id: 'order-1' }; },
    setCheckoutSession: async (...value) => calls.push(['session', ...value]),
    markCheckoutFailed: async () => {},
  };
  const stripe = {
    checkout: { sessions: {
      create: async (payload, options) => {
        calls.push(['stripe', payload, options]);
        return { id: 'cs_test_1', url: 'https://checkout.stripe.test/session' };
      },
      expire: async () => {},
    } },
  };
  const startCheckout = createCheckoutService({
    orderRepository: repository,
    stripe,
    checkoutUrls: {
      successUrl: new URL('https://client.test/checkout/success'),
      cancelUrl: new URL('https://client.test/#contact'),
    },
  });
  const result = await startCheckout({
    user: { id: 'user-1', email: 'user@example.test' },
    input: { serviceId: 'portrait', preferredDate: null, projectMessage: 'Hello' },
  });
  assert.equal(result.checkoutUrl, 'https://checkout.stripe.test/session');
  assert.equal(calls[1][1].line_items[0].price_data.unit_amount, 15000);
  assert.deepEqual(calls.at(-1), ['session', 'order-1', 'cs_test_1']);
});

test('checkout service marks an order failed when Stripe creation fails', async () => {
  let failedOrderId;
  const startCheckout = createCheckoutService({
    orderRepository: {
      findActiveService: async () => service,
      createPendingOrder: async () => ({ id: 'order-2' }),
      markCheckoutFailed: async (id) => { failedOrderId = id; },
    },
    stripe: { checkout: { sessions: { create: async () => { throw new Error('Stripe down'); } } } },
    checkoutUrls: {
      successUrl: new URL('https://client.test/checkout/success'),
      cancelUrl: new URL('https://client.test/#contact'),
    },
  });
  await assert.rejects(
    () => startCheckout({ user: { id: 'user-1', email: 'user@example.test' }, input: { serviceId: 'portrait' } }),
    (error) => error.code === 'CHECKOUT_UNAVAILABLE' && error.status === 502,
  );
  assert.equal(failedOrderId, 'order-2');
});

test('admin order service only updates paid orders', async () => {
  const serviceApi = createAdminOrderService({ findStatus: async () => ({ id: 'order-1', status: 'pending' }) });
  await assert.rejects(
    () => serviceApi.updateFulfillment('order-1', 'confirmed'),
    (error) => error.code === 'ORDER_NOT_PAID' && error.status === 409,
  );
});

test('webhook service is idempotent for an already paid order', async () => {
  let writes = 0;
  const processEvent = createWebhookService({
    findCheckoutOrder: async () => ({ id: 'order-1', userId: 'user-1', totalAmount: 15000, currency: 'usd', status: 'paid' }),
    markPaid: async () => { writes += 1; },
  });
  await processEvent({
    type: 'checkout.session.completed',
    data: { object: {
      id: 'cs_test_1', metadata: { orderId: 'order-1', userId: 'user-1' },
      payment_status: 'paid', amount_total: 15000, currency: 'usd', payment_intent: 'pi_test_1',
    } },
  });
  assert.equal(writes, 0);
});

test('webhook service marks a matching pending order paid', async () => {
  let payment;
  const processEvent = createWebhookService({
    findCheckoutOrder: async () => ({ id: 'order-1', userId: 'user-1', totalAmount: 15000, currency: 'usd', status: 'pending' }),
    markPaid: async (value) => { payment = value; },
  });
  await processEvent({
    type: 'checkout.session.completed',
    data: { object: {
      id: 'cs_test_1', metadata: { orderId: 'order-1', userId: 'user-1' },
      payment_status: 'paid', amount_total: 15000, currency: 'usd', payment_intent: 'pi_test_1',
    } },
  });
  assert.equal(payment.orderId, 'order-1');
  assert.equal(payment.checkoutSessionId, 'cs_test_1');
  assert.equal(payment.paymentIntentId, 'pi_test_1');
  assert.ok(payment.paidAt instanceof Date);
});

test('webhook service rejects mismatched payment details', async () => {
  const processEvent = createWebhookService({
    findCheckoutOrder: async () => ({ id: 'order-1', userId: 'user-1', totalAmount: 15000, currency: 'usd', status: 'pending' }),
  });
  await assert.rejects(() => processEvent({
    type: 'checkout.session.completed',
    data: { object: {
      id: 'cs_test_1', metadata: { orderId: 'order-1', userId: 'user-1' },
      payment_status: 'paid', amount_total: 1, currency: 'usd',
    } },
  }), /payment details/);
});
