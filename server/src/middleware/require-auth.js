import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../integrations/auth.js';

export async function requireAuth(req, res, next) {
  try {
    const authSession = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!authSession) {
      return res.status(401).json({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required.' } });
    }

    req.auth = authSession;
    return next();
  } catch {
    console.error('Failed to validate the user session.');
    return res.status(500).json({ error: { code: 'AUTH_VALIDATION_FAILED', message: 'Unable to validate the user session.' } });
  }
}
