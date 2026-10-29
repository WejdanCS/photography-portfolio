import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';

export function createApiRouter({ controllers, requireAuth, requireAdmin, requireCustomer }) {
  const router = Router();
  router.get('/photos', asyncHandler(controllers.catalog.photos));
  router.get('/services', asyncHandler(controllers.catalog.services));
  router.post('/checkout', requireAuth, requireCustomer, asyncHandler(controllers.checkout));
  router.get('/orders', requireAuth, requireCustomer, asyncHandler(controllers.orders.list));
  router.get('/orders/:orderId', requireAuth, requireCustomer, asyncHandler(controllers.orders.find));
  router.get('/admin/orders', requireAuth, requireAdmin, asyncHandler(controllers.adminOrders.list));
  router.get('/admin/orders/:orderId', requireAuth, requireAdmin, asyncHandler(controllers.adminOrders.find));
  router.patch('/admin/orders/:orderId/status', requireAuth, requireAdmin, asyncHandler(controllers.adminOrders.update));
  router.get('/health', asyncHandler(controllers.health));
  return router;
}
