export function apiErrorMessage(payload, fallback) {
  return typeof payload?.error?.message === 'string' ? payload.error.message : fallback;
}
