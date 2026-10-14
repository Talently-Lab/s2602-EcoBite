import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import type { PrismaClient } from '../generated/prisma/client';
import type { ApiConfig } from '../lib/config';
import { createRestaurantController } from '../controllers/restaurants.controller';
import { createUserController } from '../controllers/users.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { createRestaurantService } from '../services/restaurants.service';
import { createUserService } from '../services/users.service';

export function createApiRouter(db: PrismaClient, config: ApiConfig) {
  const apiRouter = Router();
  const users = createUserController(createUserService(db, config.jwtSecret));
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: 'Demasiados intentos. Intentá nuevamente más tarde.' },
  });

  apiRouter.get('/', (_req, res) => { res.json({ message: 'API is working!' }); });
  apiRouter.get('/restaurants', createRestaurantController(createRestaurantService(db)));
  apiRouter.post('/users/register', authLimiter, users.register);
  apiRouter.post('/users/login', authLimiter, users.login);
  apiRouter.get('/users/me', authenticate(config.jwtSecret), users.me);

  return apiRouter;
}
