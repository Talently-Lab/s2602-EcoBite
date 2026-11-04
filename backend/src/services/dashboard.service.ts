import type { PrismaClient } from '../generated/prisma/client';

export function createDashboardService(db: Pick<PrismaClient, 'pedido'>) {
  return {
    async stats() {
      const aggregate = await db.pedido.aggregate({
        where: { estado: 'COMPLETADO' },
        _count: { _all: true },
        _sum: { montoTotal: true, co2AhorradoKg: true },
      });
      return {
        totalOrders: aggregate._count._all,
        totalRevenue: Number(aggregate._sum.montoTotal ?? 0),
        totalCo2Saved: Number(aggregate._sum.co2AhorradoKg ?? 0),
      };
    },
  };
}
