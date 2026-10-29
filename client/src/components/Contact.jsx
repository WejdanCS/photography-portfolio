import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { authClient } from '../lib/auth-client.js';
import { primaryButton, secondaryButton } from '../styles.js';
import DatePicker from './DatePicker.jsx';
import { apiErrorMessage } from '../lib/api.js';

const singleLineFieldClass = 'h-[3.75rem] w-full min-w-0 max-w-full border border-border rounded-none bg-background p-s text-text-primary leading-[1.5]';

function toLocalDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getTomorrowDateInputValue() {
  const tomorrow = new Date();
  tomorrow.setHours(12, 0, 0, 0);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return toLocalDateInputValue(tomorrow);
}

function formatPrice(unitAmount, currency) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(unitAmount / 100);
}

export default function Contact() {
  const { data: session, isPending: isSessionPending } = authClient.useSession();
  const isAdmin = session?.user.role === 'admin';
  const [services, setServices] = useState([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [servicesError, setServicesError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [dateError, setDateError] = useState('');
  const [requestVersion, setRequestVersion] = useState(0);
  const minimumPreferredDate = getTomorrowDateInputValue();

  useEffect(() => {
    const controller = new AbortController();

    async function loadServices() {
      try {
        const response = await fetch('/api/services', { signal: controller.signal });
        const data = await response.json();
        if (!response.ok) throw new Error(apiErrorMessage(data, 'Failed to fetch photography sessions.'));
        if (!Array.isArray(data.data)) throw new Error('Invalid services response.');

        if (!controller.signal.aborted) setServices(data.data);
      } catch {
        if (!controller.signal.aborted) {
          setServicesError('Unable to load session prices. Please try again.');
        }
      } finally {
        if (!controller.signal.aborted) setIsLoadingServices(false);
      }
    }

    loadServices();
    return () => controller.abort();
  }, [requestVersion]);

  function retryServices() {
    setServicesError('');
    setIsLoadingServices(true);
    setRequestVersion((version) => version + 1);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!session || isAdmin || isSubmitting) return;

    const form = new FormData(event.currentTarget);
    const preferredDate = form.get('preferredDate');

    if (preferredDate && preferredDate < minimumPreferredDate) {
      setDateError('Choose a date after today.');
      return;
    }

    setDateError('');
    setCheckoutError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: form.get('serviceId'),
          preferredDate,
          message: form.get('message'),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        window.location.assign('/login?returnTo=%2F%23contact');
        return;
      }

      if (!response.ok || typeof data.data?.checkoutUrl !== 'string') {
        throw new Error(apiErrorMessage(data, 'Unable to start checkout.'));
      }

      window.location.assign(data.data.checkoutUrl);
    } catch (error) {
      setCheckoutError(error.message || 'Unable to start checkout. Please try again.');
      setIsSubmitting(false);
    }
  }

  const cannotOrder = isLoadingServices || Boolean(servicesError) || services.length === 0;

  return (
    <section id="contact" className="scroll-mt-[14rem] py-(--section-spacing) md:scroll-mt-[10rem]" aria-labelledby="contact-heading">
      <h2 id="contact-heading">Contact / Book a Shoot</h2>
      <p className="max-w-[60ch]">Choose a photography session, tell me about your idea, and continue to secure test-mode payment with Stripe.</p>
      <p id="form-note" className="max-w-[60ch] border-l-2 border-l-accent pl-s text-[0.875rem]">
        {isAdmin
          ? 'Administrator accounts manage customer bookings and cannot place orders.'
          : session
          ? `This order will be linked to ${session.user.email}. No real money will be charged.`
          : 'Sign in before ordering so the payment can be linked to your account.'}
      </p>

      {servicesError && (
        <div className="mt-m max-w-[40rem] border-y border-border py-m" role="alert">
          <p>{servicesError}</p>
          <button className={secondaryButton} type="button" onClick={retryServices}>Try again</button>
        </div>
      )}

      {isAdmin && <Link className={`${secondaryButton} mt-m self-start`} to="/admin/orders">Manage customer orders</Link>}

      <form onSubmit={handleSubmit} className={`${isAdmin ? 'hidden' : 'flex'} mt-l w-full max-w-[40rem] flex-col gap-m`} aria-describedby="form-note" aria-busy={isSubmitting}>
        <div className="flex min-w-0 flex-col gap-xs">
          <label className="font-medium" htmlFor="name">Name</label>
          <input className={singleLineFieldClass} type="text" id="name" name="name" value={session?.user.name || ''} placeholder="Sign in to continue" readOnly aria-readonly="true" />
        </div>
        <div className="flex min-w-0 flex-col gap-xs">
          <label className="font-medium" htmlFor="email">Email</label>
          <input className={singleLineFieldClass} type="email" id="email" name="email" value={session?.user.email || ''} placeholder="Sign in to continue" readOnly aria-readonly="true" />
        </div>
        <div className="flex min-w-0 flex-col gap-xs">
          <label className="font-medium" htmlFor="serviceId">Photography session</label>
          <select className={singleLineFieldClass} id="serviceId" name="serviceId" required disabled={isLoadingServices || Boolean(servicesError)}>
            <option value="">{isLoadingServices ? 'Loading session prices…' : 'Choose a session type'}</option>
            {services.map((service) => (
              <option value={service.id} key={service.id}>
                {service.name} — {formatPrice(service.unitAmount, service.currency)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex min-w-0 flex-col gap-xs">
          <label className="font-medium" htmlFor="preferredDate">Preferred date <span className="font-normal text-text-secondary">(optional)</span></label>
          <DatePicker inputId="preferredDate" error={dateError} onChange={(value) => setDateError(value && value < minimumPreferredDate ? 'Choose a date after today.' : '')} />
        </div>
        <div className="flex min-w-0 flex-col gap-xs">
          <label className="font-medium" htmlFor="message">Tell me about your project</label>
          <textarea className="w-full min-w-0 border border-border rounded-none bg-background text-text-primary p-s leading-[1.5] min-h-[10rem] resize-y" id="message" name="message" rows="5" required maxLength="2000"></textarea>
        </div>

        {checkoutError && <p className="m-0 border-l-2 border-accent pl-s" role="alert">{checkoutError}</p>}

        {isSessionPending ? (
          <button className={`${primaryButton} self-start`} type="button" disabled>Checking account…</button>
        ) : session ? (
          <button className={`${primaryButton} self-start`} type="submit" disabled={isSubmitting || cannotOrder}>
            {isSubmitting ? 'Opening Stripe…' : 'Order now'}
          </button>
        ) : (
          <Link className={`${primaryButton} self-start`} to="/login?returnTo=%2F%23contact">Sign in to order</Link>
        )}
      </form>
    </section>
  );
}
