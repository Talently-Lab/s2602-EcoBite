import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import type { PrismaClient } from '../generated/prisma/client';
import type { ApiConfig } from '../lib/config';
import { createEmailService, type EmailService } from '../lib/email';
import { createDashboardController } from '../controllers/dashboard.controller';
import { createHealthController } from '../controllers/health.controller';
import { createOrderController } from '../controllers/orders.controller';
import { createProductController } from '../controllers/products.controller';
import { createRestaurantRequestController } from '../controllers/restaurant-requests.controller';
import { createRestaurantController } from '../controllers/restaurants.controller';
import { createUserController } from '../controllers/users.controller';
import { createZoneController } from '../controllers/zones.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { createDashboardService } from '../services/dashboard.service';
import { createHealthService } from '../services/health.service';
import { createOrderService } from '../services/orders.service';
import { createProductService } from '../services/products.service';
import { createRestaurantRequestService } from '../services/restaurant-requests.service';
import { createRestaurantService } from '../services/restaurants.service';
import { createUserService } from '../services/users.service';
import { createZoneService } from '../services/zones.service';

export interface ApiDeps {
  emailService?: EmailService;
}

export function createApiRouter(db: PrismaClient, config: ApiConfig, deps?: ApiDeps) {
  const apiRouter = Router();
  const emailService = deps?.emailService ?? createEmailService(config);
  const users = createUserController(createUserService(db, config.jwtSecret));
  const restaurants = createRestaurantController(createRestaurantService(db));
  const zones = createZoneController(createZoneService(db));
  const orders = createOrderController(createOrderService(db));
  const products = createProductController(createProductService(db));
  const restaurantRequests = createRestaurantRequestController(
    createRestaurantRequestService(db, emailService));
  const dashboard = createDashboardController(createDashboardService(db));
  const health = createHealthController(createHealthService(db, config.healthCheckTimeoutMs));
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
  apiRouter.get('/health', health.check);
  apiRouter.get('/restaurants', restaurants.list);
  const restaurantAdmin = requireRole(db, 'RESTAURANTE_ADMIN');
  apiRouter.get('/restaurants/me/products', auth, restaurantAdmin, products.listMine);
  apiRouter.post('/restaurants/me/products', auth, restaurantAdmin, products.create);
  apiRouter.get('/restaurants/:id', restaurants.getById);
  apiRouter.get('/zones', zones.list);
  apiRouter.get('/packagings', products.listPackagings);
  apiRouter.post('/orders', auth, orders.create);
  apiRouter.get('/orders', auth, orders.list);
  apiRouter.get('/orders/:id', auth, orders.getById);
  apiRouter.post('/users/register', authLimiter, users.register);
  apiRouter.post('/users/login', authLimiter, users.login);
  apiRouter.get('/users/me', auth, users.me);
  apiRouter.get('/users/me/impact', auth, users.impact);
  apiRouter.get('/dashboard/stats', auth, requireRole(db, 'ADMIN_PLATAFORMA'), dashboard.stats);
  apiRouter.get('/restaurant-categories', restaurantRequests.categories);
  apiRouter.post('/restaurant-requests', auth, requireRole(db, 'CLIENTE'), restaurantRequests.submit);
  apiRouter.get('/restaurant-requests/me', auth, restaurantRequests.mine);
  const adminOnly = requireRole(db, 'ADMIN_PLATAFORMA');
  apiRouter.get('/admin/restaurant-requests', auth, adminOnly, restaurantRequests.list);
  apiRouter.get('/admin/restaurant-requests/:id', auth, adminOnly, restaurantRequests.getById);
  apiRouter.post('/admin/restaurant-requests/:id/approve', auth, adminOnly, restaurantRequests.approve);
  apiRouter.post('/admin/restaurant-requests/:id/reject', auth, adminOnly, restaurantRequests.reject);

  return apiRouter;
}
