import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { eq, inArray } from 'drizzle-orm';
import { createApp } from '../src/app.js';
import { db } from '../src/db/index.js';
import { orders, session, user } from '../src/db/schema.js';

const runId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const regularEmail = `regular-${runId}@example.invalid`;
const customerEmail = `customer-${runId}@example.invalid`;
const password = 'Test-password-1234';

let server;
let baseUrl;
let regularUserId;
let customerUserId;
let orderId;
let regularCookie;
let adminCookie;

function readCookie(response) {
  const setCookies = response.headers.getSetCookie?.() || [response.headers.get('set-cookie')];
  return setCookies
    .filter(Boolean)
    .map((cookie) => cookie.split(';', 1)[0])
    .join('; ');
}

async function authRequest(path, body) {
  const response = await fetch(`${baseUrl}/api/auth/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  assert.equal(response.status, 200);
  return { cookie: readCookie(response), data: await response.json() };
}

before(async () => {
  const app = createApp();
  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });

  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;

  const regularSignup = await authRequest('sign-up/email', {
    name: 'Regular Test User',
    email: regularEmail,
    password,
  });
  regularCookie = regularSignup.cookie;
  regularUserId = regularSignup.data.user.id;

  const customerSignup = await authRequest('sign-up/email', {
    name: 'Customer Test User',
    email: customerEmail,
    password,
  });
  customerUserId = customerSignup.data.user.id;

  const [createdOrder] = await db
    .insert(orders)
    .values({
      userId: customerUserId,
      status: 'paid',
      totalAmount: 15000,
      currency: 'usd',
      projectMessage: 'Temporary authorization test order.',
      paidAt: new Date(),
    })
    .returning({ id: orders.id });
  orderId = createdOrder.id;
});

after(async () => {
  if (orderId) await db.delete(orders).where(eq(orders.id, orderId));

  const userIds = [regularUserId, customerUserId].filter(Boolean);
  if (userIds.length > 0) await db.delete(user).where(inArray(user.id, userIds));

  if (server) {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }

  await db.$client.end();
});

test('a regular user cannot access admin orders', async () => {
  const response = await fetch(`${baseUrl}/api/admin/orders`, {
    headers: { Cookie: regularCookie },
  });

  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), {
    error: { code: 'ADMIN_REQUIRED', message: 'Administrator access required.' },
  });
});

test('public endpoints use the standard data envelope', async () => {
  for (const path of ['health', 'photos', 'services']) {
    const response = await fetch(`${baseUrl}/api/${path}`);
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.ok(Object.hasOwn(body, 'data'));
    assert.equal(body.error, undefined);
  }
});

test('unknown routes and malformed JSON use structured errors', async () => {
  const missingResponse = await fetch(`${baseUrl}/api/missing`);
  assert.equal(missingResponse.status, 404);
  assert.deepEqual(await missingResponse.json(), {
    error: { code: 'ROUTE_NOT_FOUND', message: 'Route not found.' },
  });

  const invalidJsonResponse = await fetch(`${baseUrl}/api/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{',
  });
  assert.equal(invalidJsonResponse.status, 400);
  assert.deepEqual(await invalidJsonResponse.json(), {
    error: { code: 'INVALID_JSON', message: 'Invalid JSON body.' },
  });
});

test('a user cannot read another user order by changing the ID', async () => {
  const response = await fetch(`${baseUrl}/api/orders/${orderId}`, {
    headers: { Cookie: regularCookie },
  });

  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), {
    error: { code: 'NOT_FOUND', message: 'Order not found.' },
  });
});

test('an administrator can list orders and update fulfillment without changing payment', async () => {
  await db.update(user).set({ role: 'admin' }).where(eq(user.id, regularUserId));

  const adminSignin = await authRequest('sign-in/email', {
    email: regularEmail,
    password,
  });
  adminCookie = adminSignin.cookie;

  const listResponse = await fetch(`${baseUrl}/api/admin/orders?q=${encodeURIComponent(customerEmail)}`, {
    headers: { Cookie: adminCookie },
  });
  assert.equal(listResponse.status, 200);
  const listData = await listResponse.json();
  assert.equal(listData.data.some((order) => order.id === orderId), true);
  assert.ok(listData.meta.pagination);

  const updateResponse = await fetch(`${baseUrl}/api/admin/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: {
      Cookie: adminCookie,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fulfillmentStatus: 'completed' }),
  });
  assert.equal(updateResponse.status, 200);
  const updateData = await updateResponse.json();
  assert.equal(updateData.data.status, 'paid');
  assert.equal(updateData.data.fulfillmentStatus, 'completed');
  assert.ok(updateData.data.completedAt);
});

test('an expired session cannot access admin orders', async () => {
  await db.delete(session).where(eq(session.userId, regularUserId));

  const response = await fetch(`${baseUrl}/api/admin/orders`, {
    headers: { Cookie: adminCookie },
  });

  assert.equal(response.status, 401);
});

test('the Stripe webhook rejects missing and invalid signatures', async () => {
  const missingSignature = await fetch(`${baseUrl}/api/stripe/webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  });
  assert.equal(missingSignature.status, 400);

  const invalidSignature = await fetch(`${baseUrl}/api/stripe/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Stripe-Signature': 'invalid',
    },
    body: '{}',
  });
  assert.equal(invalidSignature.status, 400);
});
