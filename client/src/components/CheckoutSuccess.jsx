import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { authClient } from '../lib/auth-client.js';
import { primaryButton, secondaryButton } from '../styles.js';

const maxPollAttempts = 10;

function formatMoney(unitAmount, currency) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(unitAmount / 100);
}

function formatMonth(month) {
  if (!month) return 'Not specified';

  const [year, monthNumber] = month.split('-').map(Number);
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, monthNumber - 1, 1)));
}

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  const { data: session, isPending: isSessionPending } = authClient.useSession();
  const userId = session?.user.id;
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [retryVersion, setRetryVersion] = useState(0);

  useEffect(() => {
    if (isSessionPending || !userId || !orderId) return undefined;

    const controller = new AbortController();
    let timeoutId;
    let attempt = 0;

    async function loadOrder() {
      try {
        const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
          credentials: 'include',
          signal: controller.signal,
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.error || 'Unable to load your order.');
        }

        if (!data.order || !Array.isArray(data.order.items)) {
          throw new Error('Invalid order response.');
        }

        setOrder(data.order);

        if (data.order.status === 'paid') {
          setStatus('paid');
          return;
        }

        if (data.order.status === 'checkout_failed') {
          setStatus('failed');
          return;
        }

        attempt += 1;
        if (attempt < maxPollAttempts) {
          setStatus('pending');
          timeoutId = window.setTimeout(loadOrder, 1000);
        } else {
          setStatus('timeout');
        }
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(requestError.message || 'Unable to load your order.');
          setStatus('error');
        }
      }
    }

    loadOrder();

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [isSessionPending, orderId, retryVersion, userId]);

  function retryOrder() {
    setError('');
    setStatus('loading');
    setRetryVersion((version) => version + 1);
  }

  if (!orderId) {
    return (
      <section className="mx-auto w-full max-w-auth py-(--section-spacing)" aria-labelledby="checkout-heading">
        <h1 id="checkout-heading">Order not found</h1>
        <p>This success link is missing its order number.</p>
        <Link className={secondaryButton} to="/#contact">Return to booking</Link>
      </section>
    );
  }

  if (isSessionPending) {
    return <p className="py-(--section-spacing)" role="status">Checking your account…</p>;
  }

  if (!session) {
    const returnTo = `/checkout/success?order_id=${encodeURIComponent(orderId)}`;

    return (
      <section className="mx-auto w-full max-w-auth py-(--section-spacing)" aria-labelledby="checkout-heading">
        <h1 id="checkout-heading">Sign in to view your order</h1>
        <p>The payment result is private and can only be viewed by the account that created the order.</p>
        <Link className={primaryButton} to={`/login?returnTo=${encodeURIComponent(returnTo)}`}>Sign in</Link>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-auth py-(--section-spacing)" aria-labelledby="checkout-heading" aria-live="polite">
      <p className="mb-s text-[0.875rem] uppercase tracking-label text-accent">Stripe test payment</p>
      <h1 id="checkout-heading">
        {status === 'paid' ? 'Payment confirmed' : 'Confirming your payment'}
      </h1>

      {(status === 'loading' || status === 'pending') && (
        <div role="status">
          <p>Stripe has returned you to the portfolio. We’re waiting for the secure webhook confirmation.</p>
          <p className="text-text-secondary">This normally takes only a few seconds.</p>
        </div>
      )}

      {status === 'timeout' && (
        <div role="status">
          <p>Your order is still pending. The webhook may be taking longer than expected.</p>
          <button className={secondaryButton} type="button" onClick={retryOrder}>Check again</button>
        </div>
      )}

      {status === 'failed' && (
        <div role="alert">
          <p>Checkout could not be completed for this order.</p>
          <Link className={secondaryButton} to="/#contact">Return to booking</Link>
        </div>
      )}

      {status === 'error' && (
        <div role="alert">
          <p>{error}</p>
          <button className={secondaryButton} type="button" onClick={retryOrder}>Try again</button>
        </div>
      )}

      {order && (
        <dl className="mt-l grid grid-cols-[auto_1fr] gap-x-m gap-y-s border-y border-border py-m">
          <dt className="font-medium">Order</dt>
          <dd className="m-0 break-all text-text-secondary">{order.id}</dd>
          <dt className="font-medium">Status</dt>
          <dd className="m-0 capitalize text-text-secondary">{order.status}</dd>
          <dt className="font-medium">Session</dt>
          <dd className="m-0 text-text-secondary">{order.items[0]?.serviceName || 'Photography session'}</dd>
          <dt className="font-medium">Amount</dt>
          <dd className="m-0 text-text-secondary">{formatMoney(order.totalAmount, order.currency)}</dd>
          <dt className="font-medium">Preferred month</dt>
          <dd className="m-0 text-text-secondary">{formatMonth(order.preferredMonth)}</dd>
        </dl>
      )}

      {status === 'paid' && (
        <p className="mt-m border-l-2 border-accent pl-s">Your test payment is complete and the order is now marked paid.</p>
      )}
    </section>
  );
}
