import type { RequestHandler } from 'express';
import { validateProduct } from '../lib/validation';
import type { createProductService } from '../services/products.service';

export function createProductController(service: ReturnType<typeof createProductService>) {
  const listPackagings: RequestHandler = async (_req, res) => {
    res.json({ packagings: await service.listPackagings() });
  };
  const create: RequestHandler = async (req, res) => {
    const product = await service.create(res.locals.userId, validateProduct(req.body));
    res.status(201).json({ product });
  };
  const listMine: RequestHandler = async (_req, res) => {
    res.json({ products: await service.listMine(res.locals.userId) });
  };
  return { listPackagings, create, listMine };
}
