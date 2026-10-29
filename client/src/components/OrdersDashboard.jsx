import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router';
import { authClient } from '../lib/auth-client.js';
import { formatDate, formatFulfillmentStatus, formatMoney, formatPreferredDate } from '../lib/order-formatters.js';
import { primaryButton, secondaryButton } from '../styles.js';

const currentStatuses = new Set(['new', 'confirmed']);
const previousStatuses = new Set(['completed', 'cancelled']);

function OrderCard({ order }) {
  return (
    <article className="border border-border p-m" aria-labelledby={`order-${order.id}`}>
      <div className="flex flex-col justify-between gap-s border-b border-border pb-s md:flex-row md:items-start">
        <div>
          <p className="m-0 text-[0.875rem] uppercase tracking-label text-accent">{formatFulfillmentStatus(order.fulfillmentStatus)}</p>
          <h2 className="mb-0 mt-xs text-h3" id={`order-${order.id}`}>{order.items[0]?.serviceName || 'Photography session'}</h2>
        </div>
        <p className="m-0 font-semibold">{formatMoney(order.totalAmount, order.currency)}</p>
      </div>

      <dl className="mb-0 mt-m grid grid-cols-1 gap-x-m gap-y-s md:grid-cols-[auto_1fr]">
        <dt className="font-medium">Order</dt>
        <dd className="m-0 break-all text-text-secondary">{order.id}</dd>
        <dt className="font-medium">Ordered</dt>
        <dd className="m-0 text-text-secondary">{formatDate(order.paidAt || order.createdAt)}</dd>
        <dt className="font-medium">Preferred date</dt>
        <dd className="m-0 text-text-secondary">{formatPreferredDate(order.preferredMonth)}</dd>
        <dt className="font-medium">Project</dt>
        <dd className="m-0 whitespace-pre-wrap text-text-secondary">{order.projectMessage}</dd>
      </dl>
    </article>
  );
}

export default function OrdersDashboard() {
  const { data: session, isPending: isSessionPending } = authClient.useSession();
  const userId = session?.user.id;
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [activeList, setActiveList] = useState('current');
  const [requestVersion, setRequestVersion] = useState(0);

  useEffect(() => {
    if (!userId) return undefined;

    const controller = new AbortController();

    async function loadOrders() {
      setStatus('loading');
      setError('');

      try {
        const response = await fetch('/api/orders', {
          credentials: 'include',
          signal: controller.signal,
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.error || 'Unable to load your orders.');
        }

        if (!Array.isArray(data.orders) || data.orders.some((order) => !Array.isArray(order.items))) {
          throw new Error('Invalid orders response.');
        }

        if (!controller.signal.aborted) {
          setOrders(data.orders);
          setStatus('ready');
        }
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(requestError.message || 'Unable to load your orders.');
          setStatus('error');
        }
      }
    }

    loadOrders();
    return () => controller.abort();
  }, [requestVersion, userId]);

  const groupedOrders = useMemo(() => ({
    current: orders.filter((order) => currentStatuses.has(order.fulfillmentStatus)),
    previous: orders.filter((order) => previousStatuses.has(order.fulfillmentStatus)),
  }), [orders]);

  if (isSessionPending) {
    return <p className="py-(--section-spacing)" role="status">Checking your account…</p>;
  }

  if (!session) {
    return <Navigate to="/login?returnTo=%2Fdashboard%2Forders" replace />;
  }

  const visibleOrders = groupedOrders[activeList];

  return (
    <section className="py-(--section-spacing)" aria-labelledby="orders-heading">
      <p className="mb-s text-[0.875rem] uppercase tracking-label text-accent">Your account</p>
      <h1 id="orders-heading">My orders</h1>
      <p className="max-w-[60ch] text-text-secondary">Track active photography bookings and review your completed or cancelled orders.</p>

      <div className="mt-l flex flex-wrap gap-s" role="group" aria-label="Choose an order list">
        <button
          className={activeList === 'current' ? primaryButton : secondaryButton}
          type="button"
          aria-pressed={activeList === 'current'}
          onClick={() => setActiveList('current')}
        >
          Current ({groupedOrders.current.length})
        </button>
        <button
          className={activeList === 'previous' ? primaryButton : secondaryButton}
          type="button"
          aria-pressed={activeList === 'previous'}
          onClick={() => setActiveList('previous')}
        >
          Previous ({groupedOrders.previous.length})
        </button>
      </div>

      {status === 'loading' && <p className="mt-l" role="status">Loading your orders…</p>}

      {status === 'error' && (
        <div className="mt-l border-y border-border py-m" role="alert">
          <p>{error}</p>
          <button className={secondaryButton} type="button" onClick={() => setRequestVersion((version) => version + 1)}>Try again</button>
        </div>
      )}

      {status === 'ready' && visibleOrders.length === 0 && (
        <div className="mt-l border-y border-border py-l">
          <h2 className="text-h3">No {activeList} orders</h2>
          <p className="text-text-secondary">
            {activeList === 'current'
              ? 'You do not have an active photography booking.'
              : 'Completed and cancelled bookings will appear here.'}
          </p>
          {activeList === 'current' && <Link className={primaryButton} to="/#contact">Book a shoot</Link>}
        </div>
      )}

      {status === 'ready' && visibleOrders.length > 0 && (
        <div className="mt-l grid gap-m">
          {visibleOrders.map((order) => <OrderCard order={order} key={order.id} />)}
        </div>
      )}
    </section>
  );
}
