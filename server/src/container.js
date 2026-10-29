import { db } from './db/index.js';
import { readCheckoutUrls } from './config/env.js';
import { getStripeWebhookSecret, stripeGateway } from './integrations/stripe.js';
import { createCatalogRepository } from './repositories/catalog-repository.js';
import { createOrderRepository } from './repositories/order-repository.js';
import { createAdminOrderRepository } from './repositories/admin-order-repository.js';
import { createSystemRepository } from './repositories/system-repository.js';
import { createCatalogService } from './services/catalog-service.js';
import { createCheckoutService } from './services/checkout-service.js';
import { createAdminOrderService, createOrderService } from './services/order-service.js';
import { createWebhookService } from './services/webhook-service.js';
import { createHealthService } from './services/health-service.js';
import { createCatalogController } from './controllers/catalog-controller.js';
import { createCheckoutController } from './controllers/checkout-controller.js';
import { createAdminOrderController, createOrderController } from './controllers/order-controller.js';
import { createWebhookController } from './controllers/webhook-controller.js';
import { createHealthController } from './controllers/health-controller.js';

export function createContainer(overrides = {}) {
  const database = overrides.db || db;
  const stripe = overrides.stripe || stripeGateway;
  const catalogRepository = overrides.catalogRepository || createCatalogRepository(database);
  const orderRepository = overrides.orderRepository || createOrderRepository(database);
  const adminRepository = overrides.adminRepository || createAdminOrderRepository(database);
  const systemRepository = overrides.systemRepository || createSystemRepository(database);
  const catalogService = createCatalogService(catalogRepository);
  const processEvent = createWebhookService(orderRepository);
  return {
    controllers: {
      catalog: createCatalogController(catalogService),
      checkout: createCheckoutController(createCheckoutService({
        orderRepository,
        stripe,
        checkoutUrls: overrides.checkoutUrls,
        getCheckoutUrls: readCheckoutUrls,
      })),
      orders: createOrderController(createOrderService(orderRepository)),
      adminOrders: createAdminOrderController(createAdminOrderService(adminRepository)),
      webhook: createWebhookController({
        stripe,
        webhookSecret: overrides.webhookSecret,
        getWebhookSecret: getStripeWebhookSecret,
        processEvent,
      }),
      health: createHealthController(createHealthService(systemRepository)),
    },
  };
}
