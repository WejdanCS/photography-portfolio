export function requireAdmin(req, res, next) {
  if (!req.auth) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  if (req.auth.user.role !== 'admin') {
    return res.status(403).json({ error: 'Administrator access required.' });
  }

  return next();
}
