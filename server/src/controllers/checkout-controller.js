import { sendData } from '../http/respond.js';
import { validateCheckoutInput } from '../validators/checkout.js';

export function createCheckoutController(startCheckout) {
  return async function checkout(req, res) {
    const input = validateCheckoutInput(req.body);
    return sendData(res, await startCheckout({ user: req.auth.user, input }), { status: 201 });
  };
}
