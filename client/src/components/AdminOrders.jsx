import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router';
import { authClient } from '../lib/auth-client.js';
import { formatDate, formatFulfillmentStatus, formatMoney, formatPaymentStatus, formatPreferredDate } from '../lib/order-formatters.js';
import { primaryButton, secondaryButton } from '../styles.js';
import { apiErrorMessage } from '../lib/api.js';

const fieldClass = 'h-[3.25rem] min-w-0 border border-border bg-background px-s text-text-primary';
const fulfillmentActions = [
  { value: 'confirmed', label: 'Confirm' },
  { value: 'completed', label: 'Complete' },
  { value: 'cancelled', label: 'Cancel' },
];

function AdminOrderCard({ order, isUpdating, onStatusChange }) {
  const isPaid = order.status === 'paid';

  return (
    <article className="border border-border p-m" aria-labelledby={`admin-order-${order.id}`}>
      <div className="flex flex-col justify-between gap-s border-b border-border pb-s md:flex-row md:items-start">
        <div>
          <p className="m-0 text-[0.875rem] uppercase tracking-label text-accent">
            {formatFulfillmentStatus(order.fulfillmentStatus)} · {formatPaymentStatus(order.status)}
          </p>
          <h2 className="mb-0 mt-xs text-h3" id={`admin-order-${order.id}`}>{order.items[0]?.serviceName || 'Photography session'}</h2>
        </div>
        <p className="m-0 font-semibold">{formatMoney(order.totalAmount, order.currency)}</p>
      </div>

      <dl className="mb-0 mt-m grid grid-cols-1 gap-x-m gap-y-s md:grid-cols-[auto_1fr_auto_1fr]">
        <dt className="font-medium">Customer</dt>
        <dd className="m-0 min-w-0 break-words text-text-secondary">{order.customerName}<br />{order.customerEmail}</dd>
        <dt className="font-medium">Order</dt>
        <dd className="m-0 break-all text-text-secondary">{order.id}</dd>
        <dt className="font-medium">Ordered</dt>
        <dd className="m-0 text-text-secondary">{formatDate(order.paidAt || order.createdAt)}</dd>
        <dt className="font-medium">Preferred date</dt>
        <dd className="m-0 text-text-secondary">{formatPreferredDate(order.preferredMonth)}</dd>
        <dt className="font-medium">Project</dt>
        <dd className="m-0 whitespace-pre-wrap break-words text-text-secondary md:col-span-3">{order.projectMessage}</dd>
      </dl>

      <div className="mt-m flex flex-wrap gap-s border-t border-border pt-m" aria-label={`Update order ${order.id}`}>
        {fulfillmentActions.map((action) => (
          <button
            className={order.fulfillmentStatus === action.value ? primaryButton : secondaryButton}
            type="button"
            key={action.value}
            disabled={!isPaid || isUpdating || order.fulfillmentStatus === action.value}
            onClick={() => onStatusChange(order.id, action.value)}
          >
            {isUpdating ? 'Updating…' : action.label}
          </button>
        ))}
      </div>
      {!isPaid && <p className="mb-0 mt-s text-[0.875rem] text-text-secondary">Fulfillment can only be updated after payment is confirmed.</p>}
    </article>
  );
}

export default function AdminOrders() {
  const { data: session, isPending: isSessionPending } = authClient.useSession();
  const isAdmin = session?.user.role === 'admin';
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [filters, setFilters] = useState({ q: '', paymentStatus: '', fulfillmentStatus: '' });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [updateError, setUpdateError] = useState('');
  const [updatingId, setUpdatingId] = useState('');
  const [requestVersion, setRequestVersion] = useState(0);

  useEffect(() => {
    if (!isAdmin) return undefined;

    const controller = new AbortController();

    async function loadOrders() {
      setStatus('loading');
      setError('');

      const params = new URLSearchParams({ page: String(pagination.page) });
      Object.entries(appliedFilters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });

      try {
        const response = await fetch(`/api/admin/orders?${params}`, {
          credentials: 'include',
          signal: controller.signal,
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) throw new Error(apiErrorMessage(data, 'Unable to load orders.'));
        if (!Array.isArray(data.data) || !data.meta?.pagination) throw new Error('Invalid admin orders response.');

        if (!controller.signal.aborted) {
          setOrders(data.data);
          setPagination(data.meta.pagination);
          setStatus('ready');
        }
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(requestError.message || 'Unable to load orders.');
          setStatus('error');
        }
      }
    }

    loadOrders();
    return () => controller.abort();
  }, [appliedFilters, isAdmin, pagination.page, requestVersion]);

  function applyFilters(event) {
    event.preventDefault();
    setPagination((current) => ({ ...current, page: 1 }));
    setAppliedFilters(filters);
  }

  async function changeStatus(orderId, fulfillmentStatus) {
    if (updatingId) return;
    setUpdatingId(orderId);
    setUpdateError('');

    try {
      const response = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fulfillmentStatus }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) throw new Error(apiErrorMessage(data, 'Unable to update the order.'));

      setOrders((currentOrders) => currentOrders.map((order) => (
        order.id === orderId ? { ...order, ...data.data } : order
      )));
    } catch (requestError) {
      setUpdateError(requestError.message || 'Unable to update the order.');
    } finally {
      setUpdatingId('');
    }
  }

  if (isSessionPending) {
    return <p className="py-(--section-spacing)" role="status">Checking administrator access…</p>;
  }

  if (!session) {
    return <Navigate to="/login?returnTo=%2Fadmin%2Forders" replace />;
  }

  if (!isAdmin) {
    return (
      <section className="mx-auto w-full max-w-auth py-(--section-spacing)" aria-labelledby="admin-denied-heading">
        <h1 id="admin-denied-heading">Access denied</h1>
        <p>This page is only available to the site administrator.</p>
        <Link className={secondaryButton} to="/">Back to home</Link>
      </section>
    );
  }

  return (
    <section className="py-(--section-spacing)" aria-labelledby="admin-orders-heading">
      <p className="mb-s text-[0.875rem] uppercase tracking-label text-accent">Administration</p>
      <h1 id="admin-orders-heading">Manage orders</h1>
      <p className="max-w-[60ch] text-text-secondary">Search all customer orders and update fulfillment after Stripe confirms payment.</p>

      <form className="mt-l grid gap-s border-y border-border py-m md:grid-cols-[minmax(12rem,1fr)_auto_auto_auto]" onSubmit={applyFilters}>
        <div className="flex min-w-0 flex-col gap-xs">
          <label className="font-medium" htmlFor="admin-order-search">Search</label>
          <input
            className={fieldClass}
            id="admin-order-search"
            type="search"
            maxLength="200"
            value={filters.q}
            placeholder="Email, customer, or order ID"
            onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))}
          />
        </div>
        <div className="flex min-w-0 flex-col gap-xs">
          <label className="font-medium" htmlFor="admin-payment-filter">Payment</label>
          <select className={fieldClass} id="admin-payment-filter" value={filters.paymentStatus} onChange={(event) => setFilters((current) => ({ ...current, paymentStatus: event.target.value }))}>
            <option value="">All payments</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="checkout_failed">Failed</option>
          </select>
        </div>
        <div className="flex min-w-0 flex-col gap-xs">
          <label className="font-medium" htmlFor="admin-fulfillment-filter">Fulfillment</label>
          <select className={fieldClass} id="admin-fulfillment-filter" value={filters.fulfillmentStatus} onChange={(event) => setFilters((current) => ({ ...current, fulfillmentStatus: event.target.value }))}>
            <option value="">All statuses</option>
            <option value="new">New</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <button className={`${primaryButton} self-end`} type="submit">Apply</button>
      </form>

      {updateError && <p className="mt-m border-l-2 border-accent pl-s" role="alert">{updateError}</p>}
      {status === 'loading' && <p className="mt-l" role="status">Loading orders…</p>}
      {status === 'error' && (
        <div className="mt-l border-y border-border py-m" role="alert">
          <p>{error}</p>
          <button className={secondaryButton} type="button" onClick={() => setRequestVersion((version) => version + 1)}>Try again</button>
        </div>
      )}
      {status === 'ready' && orders.length === 0 && <p className="mt-l border-y border-border py-l">No orders match these filters.</p>}
      {status === 'ready' && orders.length > 0 && (
        <div className="mt-l grid gap-m">
          <p className="m-0 text-[0.875rem] text-text-secondary">{pagination.total} total orders</p>
          {orders.map((order) => (
            <AdminOrderCard
              order={order}
              isUpdating={updatingId === order.id}
              onStatusChange={changeStatus}
              key={order.id}
            />
          ))}
          <nav className="flex flex-wrap items-center justify-between gap-s" aria-label="Orders pagination">
            <button className={secondaryButton} type="button" disabled={pagination.page <= 1} onClick={() => setPagination((current) => ({ ...current, page: current.page - 1 }))}>Previous page</button>
            <span>Page {pagination.page} of {pagination.totalPages}</span>
            <button className={secondaryButton} type="button" disabled={pagination.page >= pagination.totalPages} onClick={() => setPagination((current) => ({ ...current, page: current.page + 1 }))}>Next page</button>
          </nav>
        </div>
      )}
    </section>
  );
}
