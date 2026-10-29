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

export const stripeGateway = {
  checkout: {
    sessions: {
      create(...args) {
        return getStripeClient().checkout.sessions.create(...args);
      },
      expire(...args) {
        return getStripeClient().checkout.sessions.expire(...args);
      },
    },
  },
  webhooks: {
    constructEvent(...args) {
      return getStripeClient().webhooks.constructEvent(...args);
    },
  },
};
