import 'dotenv/config';

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is missing from the server environment.`);
  return value;
}

function httpUrl(name) {
  const url = new URL(required(name));
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error(`${name} must use HTTP or HTTPS.`);
  return url;
}

export function readAppConfig() {
  const port = Number(process.env.PORT || 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535.');
  }
  return { port, clientOrigin: httpUrl('CLIENT_URL').origin };
}

export function readAuthConfig() {
  const secret = required('BETTER_AUTH_SECRET');
  if (secret.length < 32) throw new Error('BETTER_AUTH_SECRET must contain at least 32 random characters.');
  return { secret, baseURL: httpUrl('BETTER_AUTH_URL').toString(), trustedOrigin: httpUrl('CLIENT_URL').origin };
}

export function readDatabaseUrl() {
  return required('DATABASE_URL');
}

export function readCheckoutUrls() {
  return { successUrl: httpUrl('CHECKOUT_SUCCESS_URL'), cancelUrl: httpUrl('CHECKOUT_CANCEL_URL') };
}

export function readStripeConfig() {
  const secretKey = required('STRIPE_SECRET_KEY');
  if (!secretKey.startsWith('sk_test_')) {
    throw new Error('STRIPE_SECRET_KEY must be a Stripe test-mode secret key for this assignment.');
  }
  return { secretKey, webhookSecret: required('STRIPE_WEBHOOK_SECRET') };
}
