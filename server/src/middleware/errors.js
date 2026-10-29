import { AppError } from '../errors/app-error.js';

export function notFoundHandler(req, res) {
  return res.status(404).json({
    error: { code: 'ROUTE_NOT_FOUND', message: 'Route not found.' },
  });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: { code: 'INVALID_JSON', message: 'Invalid JSON body.' },
    });
  }

  if (error.type === 'entity.too.large') {
    return res.status(413).json({
      error: { code: 'PAYLOAD_TOO_LARGE', message: 'Request body is too large.' },
    });
  }

  if (error instanceof AppError) {
    const body = { error: { code: error.code, message: error.message } };
    if (error.details) body.error.details = error.details;
    return res.status(error.status).json(body);
  }

  console.error('An unexpected server error occurred.');
  return res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Internal server error.' },
  });
}
