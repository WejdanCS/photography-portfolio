import { Router } from 'express';
import { and, eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { orderItems, orders, services } from '../db/schema.js';
import { getStripeClient } from '../stripe.js';

const router = Router();
const datePattern = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

function todayInBookingTimeZone() {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: process.env.BOOKING_TIME_ZONE || 'Asia/Riyadh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = Object.fromEntries(formatter.formatToParts(new Date()).map(({ type, value }) => [type, value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function isValidDateInput(value) {
  if (!datePattern.test(value)) return false;

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

export function readCheckoutInput(body, today = todayInBookingTimeZone()) {
  const serviceId = typeof body?.serviceId === 'string' ? body.serviceId.trim() : '';
  const preferredDate = typeof body?.preferredDate === 'string' ? body.preferredDate.trim() : '';
  const projectMessage = typeof body?.message === 'string' ? body.message.trim() : '';

  if (!serviceId || serviceId.length > 100) {
    return { error: 'Choose a valid photography session.' };
  }

  if (preferredDate && !isValidDateInput(preferredDate)) {
    return { error: 'Preferred date must be a valid date in YYYY-MM-DD format.' };
  }

  if (preferredDate && preferredDate <= today) {
    return { error: 'Preferred date must be after today.' };
  }

  if (!projectMessage || projectMessage.length > 2000) {
    return { error: 'Project message must contain between 1 and 2000 characters.' };
  }

  return {
    value: {
      serviceId,
      preferredDate: preferredDate || null,
      projectMessage,
    },
  };
}

function readCheckoutUrl(variableName) {
  const value = process.env[variableName];

  if (!value) {
    throw new Error(`${variableName} is missing from the server environment.`);
  }

  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error(`${variableName} must use HTTP or HTTPS.`);
  }

  return url;
}

function buildSuccessUrl(orderId) {
  const successUrl = readCheckoutUrl('CHECKOUT_SUCCESS_URL');
  successUrl.searchParams.set('order_id', orderId);

  // Stripe replaces this literal placeholder after hosted Checkout succeeds.
  return `${successUrl.toString()}&session_id={CHECKOUT_SESSION_ID}`;
}

router.post('/', async (req, res) => {
  const input = readCheckoutInput(req.body);
  if (input.error) return res.status(400).json({ error: input.error });

  const { serviceId, preferredDate, projectMessage } = input.value;
  const { user } = req.auth;

  let orderId;
  let checkoutSession;

  try {
    const [service] = await db
      .select()
      .from(services)
      .where(and(eq(services.id, serviceId), eq(services.isActive, true)))
      .limit(1);

    if (!service) {
      return res.status(404).json({ error: 'Photography session not found.' });
    }

    const order = await db.transaction(async (transaction) => {
      const [createdOrder] = await transaction
        .insert(orders)
        .values({
          userId: user.id,
          totalAmount: service.unitAmount,
          currency: service.currency,
          preferredMonth: preferredDate,
          projectMessage,
        })
        .returning({ id: orders.id });

      await transaction.insert(orderItems).values({
        orderId: createdOrder.id,
        serviceId: service.id,
        serviceName: service.name,
        unitAmount: service.unitAmount,
        quantity: 1,
        lineTotal: service.unitAmount,
      });

      return createdOrder;
    });

    orderId = order.id;

    const stripe = getStripeClient();
    checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: user.email,
      client_reference_id: orderId,
      metadata: {
        orderId,
        userId: user.id,
      },
      payment_intent_data: {
        metadata: {
          orderId,
          userId: user.id,
        },
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: service.currency,
            unit_amount: service.unitAmount,
            product_data: {
              name: `${service.name} photography session`,
              description: service.description,
            },
          },
        },
      ],
      success_url: buildSuccessUrl(orderId),
      cancel_url: readCheckoutUrl('CHECKOUT_CANCEL_URL').toString(),
      submit_type: 'book',
    }, {
      idempotencyKey: `checkout-order-${orderId}`,
    });

    if (!checkoutSession.url) {
      throw new Error('Stripe did not return a hosted Checkout URL.');
    }

    await db
      .update(orders)
      .set({ stripeCheckoutSessionId: checkoutSession.id })
      .where(eq(orders.id, orderId));

    return res.status(201).json({ checkoutUrl: checkoutSession.url });
  } catch (error) {
    if (checkoutSession?.id) {
      try {
        await getStripeClient().checkout.sessions.expire(checkoutSession.id);
      } catch {
        console.error('Failed to expire an incomplete Stripe Checkout Session.');
      }
    }

    if (orderId) {
      try {
        await db
          .update(orders)
          .set({ status: 'checkout_failed' })
          .where(and(eq(orders.id, orderId), eq(orders.status, 'pending')));
      } catch {
        console.error('Failed to record the Checkout error on the order.');
      }
    }

    console.error('Failed to create a Stripe Checkout Session.', error.message);
    return res.status(502).json({ error: 'Unable to start checkout. Please try again.' });
  }
});

export default router;
