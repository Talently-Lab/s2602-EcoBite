import type { RequestHandler } from 'express';
import type { createDashboardService } from '../services/dashboard.service';

export function createDashboardController(service: ReturnType<typeof createDashboardService>) {
  const stats: RequestHandler = async (_req, res) => {
    res.json(await service.stats());
  };
  return { stats };
}
