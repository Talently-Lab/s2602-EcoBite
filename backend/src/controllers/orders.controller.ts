import type { RequestHandler } from 'express';
import { validateOrder, validatePagination } from '../lib/validation';
import type { createOrderService } from '../services/orders.service';

export function createOrderController(service: ReturnType<typeof createOrderService>) {
  const create: RequestHandler = async (req, res) => {
    const { order, created } = await service.create(res.locals.userId, validateOrder(req.body));
    res.status(created ? 201 : 200).json({ order });
  };
  const list: RequestHandler = async (req, res) => {
    res.json(await service.list(res.locals.userId, validatePagination(req.query)));
  };
  const getById: RequestHandler = async (req, res) => {
    res.json({ order: await service.getById(res.locals.userId, String(req.params.id)) });
  };
  return { create, list, getById };
}
