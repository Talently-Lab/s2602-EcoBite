import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import type { PrismaClient } from '../generated/prisma/client';
import type { ApiConfig } from '../lib/config';
import { createOrderController } from '../controllers/orders.controller';
import { createRestaurantController } from '../controllers/restaurants.controller';
import { createUserController } from '../controllers/users.controller';
import { createZoneController } from '../controllers/zones.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { createOrderService } from '../services/orders.service';
import { createRestaurantService } from '../services/restaurants.service';
import { createUserService } from '../services/users.service';
import { createZoneService } from '../services/zones.service';

export function createApiRouter(db: PrismaClient, config: ApiConfig) {
  const apiRouter = Router();
  const users = createUserController(createUserService(db, config.jwtSecret));
  const restaurants = createRestaurantController(createRestaurantService(db));
  const zones = createZoneController(createZoneService(db));
  const orders = createOrderController(createOrderService(db));
  const auth = authenticate(config.jwtSecret);
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: 'Demasiados intentos. Intentá nuevamente más tarde.' },
  });

  // Resolved relative to this module so it works from src/ (tsx) and dist/ (node).
  const specPath = join(__dirname, '..', '..', 'openapi.yaml');
  let specCache: string | undefined;

  apiRouter.get('/', (_req, res) => { res.json({ message: 'API is working!' }); });
  apiRouter.get('/openapi.yaml', async (_req, res) => {
    specCache ??= await readFile(specPath, 'utf8');
    res.type('application/yaml').send(specCache);
  });
  apiRouter.get('/restaurants', restaurants.list);
  apiRouter.get('/restaurants/:id', restaurants.getById);
  apiRouter.get('/zones', zones.list);
  apiRouter.post('/orders', auth, orders.create);
  apiRouter.get('/orders', auth, orders.list);
  apiRouter.get('/orders/:id', auth, orders.getById);
  apiRouter.post('/users/register', authLimiter, users.register);
  apiRouter.post('/users/login', authLimiter, users.login);
  apiRouter.get('/users/me', auth, users.me);

  return apiRouter;
}
