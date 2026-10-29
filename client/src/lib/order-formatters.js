export function formatMoney(unitAmount, currency) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(unitAmount / 100);
}

export function formatPreferredDate(value) {
  if (!value) return 'Not specified';

  const [year, monthNumber, day = 1] = value.split('-').map(Number);
  return new Intl.DateTimeFormat('en-US', {
    day: value.length === 10 ? 'numeric' : undefined,
    month: value.length === 10 ? 'short' : 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, monthNumber - 1, day)));
}

export function formatDate(date) {
  if (!date) return 'Not available';

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
  }).format(new Date(date));
}

export function formatFulfillmentStatus(status) {
  return {
    new: 'New',
    confirmed: 'Confirmed',
    completed: 'Completed',
    cancelled: 'Cancelled',
  }[status] || status;
}

export function formatPaymentStatus(status) {
  return {
    pending: 'Pending',
    paid: 'Paid',
    checkout_failed: 'Failed',
  }[status] || status;
}
