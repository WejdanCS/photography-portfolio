import express from 'express';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { readAppConfig } from './config/env.js';
import { auth } from './integrations/auth.js';
import { createContainer } from './container.js';
import { createApiRouter } from './routes/index.js';
import { requireAuth } from './middleware/require-auth.js';
import { requireAdmin } from './middleware/require-admin.js';
import { requireCustomer } from './middleware/require-customer.js';
import { asyncHandler } from './middleware/async-handler.js';
import { errorHandler, notFoundHandler } from './middleware/errors.js';

export function createApp(options = {}) {
  const app = express();
  const config = options.config || readAppConfig();
  const container = options.container || createContainer(options.dependencies);
  app.disable('x-powered-by');
  app.use(cors({ origin: config.clientOrigin, credentials: true }));
  app.all('/api/auth/*splat', toNodeHandler(auth));
  app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), asyncHandler(container.controllers.webhook));
  app.use(express.json({ limit: '100kb' }));
  app.use('/api', createApiRouter({
    controllers: container.controllers,
    requireAuth,
    requireAdmin,
    requireCustomer,
  }));
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

const app = createApp();

export default app;
