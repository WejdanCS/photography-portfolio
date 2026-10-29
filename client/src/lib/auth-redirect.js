export function resolveAuthReturnTo(requestedReturn, role) {
  const isSafeLocalPath = requestedReturn?.startsWith('/')
    && !requestedReturn.startsWith('//')
    && !requestedReturn.includes('\\');

  if (!isSafeLocalPath) return '/';

  const isAdminPath = requestedReturn === '/admin' || requestedReturn.startsWith('/admin/');
  if (isAdminPath && role !== 'admin') return '/';

  return requestedReturn;
}
