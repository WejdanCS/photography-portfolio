import { sendData } from '../http/respond.js';
import { validateAdminOrderList, validateFulfillmentStatus, validateOrderId } from '../validators/admin-orders.js';

export function createOrderController(service) {
  return {
    async list(req, res) {
      res.set('Cache-Control', 'no-store');
      return sendData(res, await service.listForUser(req.auth.user.id));
    },
    async find(req, res) {
      res.set('Cache-Control', 'no-store');
      return sendData(res, await service.findForUser(validateOrderId(req.params), req.auth.user.id));
    },
  };
}

export function createAdminOrderController(service) {
  return {
    async list(req, res) {
      res.set('Cache-Control', 'no-store');
      const result = await service.list(validateAdminOrderList(req.query));
      return sendData(res, result.orders, { meta: { pagination: result.pagination } });
    },
    async find(req, res) {
      res.set('Cache-Control', 'no-store');
      return sendData(res, await service.find(validateOrderId(req.params)));
    },
    async update(req, res) {
      res.set('Cache-Control', 'no-store');
      const { fulfillmentStatus } = validateFulfillmentStatus(req.body);
      return sendData(res, await service.updateFulfillment(validateOrderId(req.params), fulfillmentStatus));
    },
  };
}
