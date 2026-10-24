import { createAuthClient } from 'better-auth/react';

// Requests use /api/auth on this origin, forwarded to Express by the proxy.
export const authClient = createAuthClient({
  basePath: '/api/auth',
  fetchOptions: { credentials: 'include' },
});
