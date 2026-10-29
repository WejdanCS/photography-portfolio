import { sendData } from '../http/respond.js';

export function createHealthController(checkHealth) {
  return async function health(req, res) {
    res.set('Cache-Control', 'no-store');
    return sendData(res, await checkHealth());
  };
}
