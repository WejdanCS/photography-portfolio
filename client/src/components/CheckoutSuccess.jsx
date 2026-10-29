import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { authClient } from '../lib/auth-client.js';
import { formatFulfillmentStatus, formatMoney, formatPaymentStatus, formatPreferredDate } from '../lib/order-formatters.js';
import { primaryButton, secondaryButton } from '../styles.js';

const maxPollAttempts = 10;

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  const { data: session, isPending: isSessionPending } = authClient.useSession();
  const userId = session?.user.id;
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [resultKey, setResultKey] = useState(null);
  const [retryVersion, setRetryVersion] = useState(0);
  const accountOrderKey = userId && orderId ? `${userId}:${orderId}` : null;
  const isCurrentResult = resultKey === accountOrderKey;
  const displayedOrder = isCurrentResult ? order : null;
  const displayedStatus = isCurrentResult ? status : 'loading';
  const displayedError = isCurrentResult ? error : '';

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

        setResultKey(accountOrderKey);
        setOrder(data.order);
        setError('');

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
          setResultKey(accountOrderKey);
          setOrder(null);
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
  }, [accountOrderKey, isSessionPending, orderId, retryVersion, userId]);

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
        {displayedStatus === 'paid' ? 'Payment confirmed' : 'Confirming your payment'}
      </h1>

      {(displayedStatus === 'loading' || displayedStatus === 'pending') && (
        <div role="status">
          <p>Stripe has returned you to the portfolio. We’re waiting for the secure webhook confirmation.</p>
          <p className="text-text-secondary">This normally takes only a few seconds.</p>
        </div>
      )}

      {displayedStatus === 'timeout' && (
        <div role="status">
          <p>Your order is still pending. The webhook may be taking longer than expected.</p>
          <button className={secondaryButton} type="button" onClick={retryOrder}>Check again</button>
        </div>
      )}

      {displayedStatus === 'failed' && (
        <div role="alert">
          <p>Checkout could not be completed for this order.</p>
          <Link className={secondaryButton} to="/#contact">Return to booking</Link>
        </div>
      )}

      {displayedStatus === 'error' && (
        <div role="alert">
          <p>{displayedError}</p>
          <button className={secondaryButton} type="button" onClick={retryOrder}>Try again</button>
        </div>
      )}

      {displayedOrder && (
        <dl className="mt-l grid grid-cols-[auto_1fr] gap-x-m gap-y-s border-y border-border py-m">
          <dt className="font-medium">Order</dt>
          <dd className="m-0 break-all text-text-secondary">{displayedOrder.id}</dd>
          <dt className="font-medium">Status</dt>
          <dd className="m-0 text-text-secondary">{formatPaymentStatus(displayedOrder.status)}</dd>
          <dt className="font-medium">Booking status</dt>
          <dd className="m-0 text-text-secondary">{formatFulfillmentStatus(displayedOrder.fulfillmentStatus)}</dd>
          <dt className="font-medium">Session</dt>
          <dd className="m-0 text-text-secondary">{displayedOrder.items[0]?.serviceName || 'Photography session'}</dd>
          <dt className="font-medium">Amount</dt>
          <dd className="m-0 text-text-secondary">{formatMoney(displayedOrder.totalAmount, displayedOrder.currency)}</dd>
          <dt className="font-medium">Preferred date</dt>
          <dd className="m-0 text-text-secondary">{formatPreferredDate(displayedOrder.preferredMonth)}</dd>
        </dl>
      )}

      {displayedStatus === 'paid' && (
        <div className="mt-m">
          <p className="border-l-2 border-accent pl-s">Your payment is complete. Your booking is now received, and the photographer will contact you to confirm the details.</p>
          <div className="mt-m flex flex-wrap gap-s">
            <Link className={primaryButton} to="/dashboard/orders">View my orders</Link>
            <Link className={secondaryButton} to="/">Back to home</Link>
          </div>
        </div>
      )}
    </section>
  );
}
