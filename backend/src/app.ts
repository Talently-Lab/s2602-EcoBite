import express from 'express';
import cors from 'cors';
import { apiReference } from '@scalar/express-api-reference';
import type { PrismaClient } from './generated/prisma/client';
import type { ApiConfig } from './lib/config';
import { HttpError } from './lib/http-error';
import { handleError } from './middlewares/error.middleware';
import { createApiRouter } from './routes/index.route';

export function createApp(db: PrismaClient, config: ApiConfig) {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', config.trustProxyHops);
  app.use(cors({
    origin: config.corsOrigins,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));
  app.use((req, res, next) => {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('Cache-Control', 'no-store');
    if (req.method === 'POST' && !req.is('application/json')) {
      throw new HttpError(415, 'Se requiere Content-Type: application/json.');
    }
    next();
  });
  app.use(express.json({ limit: '16kb' }));
  app.use('/api', createApiRouter(db, config));
  app.use('/docs', apiReference({
    pageTitle: 'EcoBite API Reference',
    url: '/api/openapi.yaml',
    bundle: 'https://cdn.jsdelivr.net/npm/@scalar/api-reference@1.75.0/esm.js',
  }));
  app.use((_req, _res) => { throw new HttpError(404, 'Ruta no encontrada.'); });
  app.use(handleError);
  return app;
}
