import { AppError, notFound } from '../errors/app-error.js';

export function createOrderService(repository) {
  return {
    listForUser: (userId) => repository.listPaidForUser(userId),
    async findForUser(orderId, userId) {
      const order = await repository.findForUser(orderId, userId);
      if (!order) throw notFound('Order not found.');
      return order;
    },
  };
}

export function createAdminOrderService(repository) {
  return {
    list: (filters) => repository.list(filters),
    async find(orderId) {
      const order = await repository.find(orderId);
      if (!order) throw notFound('Order not found.');
      return order;
    },
    async updateFulfillment(orderId, fulfillmentStatus) {
      const existing = await repository.findStatus(orderId);
      if (!existing) throw notFound('Order not found.');
      if (existing.status !== 'paid') {
        throw new AppError(409, 'ORDER_NOT_PAID', 'Only paid orders can change fulfillment status.');
      }
      const updated = await repository.updateFulfillment(orderId, fulfillmentStatus, new Date());
      if (!updated) throw new AppError(409, 'ORDER_CHANGED', 'The order changed before it could be updated.');
      return updated;
    },
  };
}
