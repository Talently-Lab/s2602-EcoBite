import type { RequestHandler } from 'express';
import type { createRestaurantService } from '../services/restaurants.service';

export function createRestaurantController(service: ReturnType<typeof createRestaurantService>): RequestHandler {
  return async (_req, res) => {
    res.json(await service.list());
  };
}
