import { sendData } from '../http/respond.js';

export function createCatalogController(service) {
  return {
    async photos(req, res) { return sendData(res, await service.listPhotos()); },
    async services(req, res) {
      res.set('Cache-Control', 'no-store');
      return sendData(res, await service.listServices());
    },
  };
}
