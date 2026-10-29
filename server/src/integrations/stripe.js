import Stripe from 'stripe';
import { readStripeConfig } from '../config/env.js';

let stripeClient;

export function getStripeClient() {
  stripeClient ??= new Stripe(readStripeConfig().secretKey);
  return stripeClient;
}

export function getStripeWebhookSecret() {
  return readStripeConfig().webhookSecret;
}
