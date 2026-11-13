import type { RequestHandler } from 'express';
import { validatePagination } from '../lib/validation';
import type { createRestaurantService } from '../services/restaurants.service';

export function createRestaurantController(service: ReturnType<typeof createRestaurantService>) {
  const list: RequestHandler = async (req, res) => {
    res.json(await service.list(validatePagination(req.query)));
  };
  const getById: RequestHandler = async (req, res) => {
    res.json(await service.getById(String(req.params.id)));
  };
  const me: RequestHandler = async (_req, res) => {
    res.json({ restaurant: await service.getMine(res.locals.userId) });
  };
  const listMineOrders: RequestHandler = async (req, res) => {
    res.json(await service.listMineOrders(res.locals.userId, validatePagination(req.query)));
  };
  return { list, getById, me, listMineOrders };
}
