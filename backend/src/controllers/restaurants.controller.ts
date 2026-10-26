import type { RequestHandler } from 'express';
import type { createRestaurantService } from '../services/restaurants.service';

export function createRestaurantController(service: ReturnType<typeof createRestaurantService>) {
  const list: RequestHandler = async (_req, res) => {
    res.json(await service.list());
  };
  const getById: RequestHandler = async (req, res) => {
    res.json(await service.getById(String(req.params.id)));
  };
  return { list, getById };
}
