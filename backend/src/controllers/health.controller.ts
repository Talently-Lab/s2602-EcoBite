import type { RequestHandler } from 'express';
import type { createHealthService } from '../services/health.service';

export function createHealthController(service: ReturnType<typeof createHealthService>) {
  const check: RequestHandler = async (_req, res) => {
    res.json(await service.check());
  };
  return { check };
}
