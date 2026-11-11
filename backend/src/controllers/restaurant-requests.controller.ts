import type { RequestHandler } from 'express';
import {
  validateEmptyBody, validatePagination, validateRequestStatus, validateRestaurantRequest,
} from '../lib/validation';
import type { createRestaurantRequestService } from '../services/restaurant-requests.service';

export function createRestaurantRequestController(
  service: ReturnType<typeof createRestaurantRequestService>,
) {
  const categories: RequestHandler = async (_req, res) => {
    res.json({ categories: service.categories() });
  };
  const submit: RequestHandler = async (req, res) => {
    const request = await service.submit(res.locals.userId, validateRestaurantRequest(req.body));
    res.status(201).json({ request });
  };
  const mine: RequestHandler = async (_req, res) => {
    res.json({ request: await service.mine(res.locals.userId) });
  };
  const list: RequestHandler = async (req, res) => {
    res.json(await service.list(
      validateRequestStatus(req.query.status), validatePagination(req.query)));
  };
  const getById: RequestHandler = async (req, res) => {
    res.json({ request: await service.getById(String(req.params.id)) });
  };
  const approve: RequestHandler = async (req, res) => {
    validateEmptyBody(req.body);
    res.json({ request: await service.approve(String(req.params.id), res.locals.userId) });
  };
  const reject: RequestHandler = async (req, res) => {
    validateEmptyBody(req.body);
    res.json({ request: await service.reject(String(req.params.id), res.locals.userId) });
  };
  return { categories, submit, mine, list, getById, approve, reject };
}
