import { AppError } from '../errors/app-error.js';
import { sendData } from '../http/respond.js';

export function createWebhookController({ stripe, webhookSecret, processEvent }) {
  return async function webhook(req, res) {
    const signature = req.get('stripe-signature');
    if (!signature) throw new AppError(400, 'STRIPE_SIGNATURE_MISSING', 'Missing Stripe signature.');
    let event;
    try { event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret); } catch {
      throw new AppError(400, 'STRIPE_SIGNATURE_INVALID', 'Invalid Stripe signature.');
    }
    try { await processEvent(event); } catch {
      console.error('Failed to process a verified Stripe webhook event.');
      throw new AppError(500, 'WEBHOOK_PROCESSING_FAILED', 'Unable to process Stripe webhook.');
    }
    return sendData(res, { received: true });
  };
}
