import type { RequestHandler } from 'express';
import type { createRestaurantService } from '../services/restaurants.service';

export function createRestaurantController(service: ReturnType<typeof createRestaurantService>) {
  const list: RequestHandler = async (_req, res) => {
    res.json(await service.list());
  };
  const getById: RequestHandler = async (req, res) => {
    res.json(await service.getById(String(req.params.id)));
  };
  const me: RequestHandler = async (_req, res) => {
    res.json({ restaurant: await service.getMine(res.locals.userId) });
  };
  const listMineOrders: RequestHandler = async (_req, res) => {
    res.json({ orders: await service.listMineOrders(res.locals.userId) });
  };
  return { list, getById, me, listMineOrders };
}
