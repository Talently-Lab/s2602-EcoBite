import type { PrismaClient } from '../generated/prisma/client';

export function createZoneService(db: Pick<PrismaClient, 'zona'>) {
  return {
    async list() {
      const zones = await db.zona.findMany({
        where: { activo: true },
        orderBy: [{ nombreBarrio: 'asc' }, { id: 'asc' }],
        select: { id: true, nombreBarrio: true, comuna: true, distanciaPromedioKm: true },
      });
      return zones.map((zone) => ({
        id: zone.id,
        name: zone.nombreBarrio,
        comuna: zone.comuna,
        distanceKm: Number(zone.distanciaPromedioKm),
      }));
    },
  };
}
