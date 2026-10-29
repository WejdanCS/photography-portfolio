export function requireCustomer(req, res, next) {
  if (!req.auth) {
    return res.status(401).json({
      error: { code: 'AUTH_REQUIRED', message: 'Authentication required.' },
    });
  }

  if (req.auth.user.role === 'admin') {
    return res.status(403).json({
      error: { code: 'CUSTOMER_ONLY', message: 'Administrator accounts cannot place or view customer orders.' },
    });
  }

  return next();
}
