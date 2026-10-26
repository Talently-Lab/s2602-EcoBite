import type { RequestHandler } from 'express';
import type { createZoneService } from '../services/zones.service';

export function createZoneController(service: ReturnType<typeof createZoneService>) {
  const list: RequestHandler = async (_req, res) => {
    res.json(await service.list());
  };
  return { list };
}
