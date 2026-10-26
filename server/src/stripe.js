import 'dotenv/config';
import Stripe from 'stripe';

let stripeClient;

export function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is missing from the server environment.');
  }

  if (!secretKey.startsWith('sk_test_')) {
    throw new Error('STRIPE_SECRET_KEY must be a Stripe test-mode secret key for this assignment.');
  }

  stripeClient ??= new Stripe(secretKey);
  return stripeClient;
}

export function getStripeWebhookSecret() {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is missing from the server environment.');
  }

  return webhookSecret;
}
