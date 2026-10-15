import type { PrismaClient } from '../generated/prisma/client';

export function createRestaurantService(db: Pick<PrismaClient, 'restaurante'>) {
  return {
    async list() {
      const restaurants = await db.restaurante.findMany({
        where: { activo: true, esEco: true },
        orderBy: [{ nombre: 'asc' }, { id: 'asc' }],
        select: {
          id: true, nombre: true, categoria: true, esEco: true,
          zona: { select: { id: true, nombreBarrio: true } },
        },
      });
      return restaurants.map((restaurant) => ({
        id: restaurant.id,
        name: restaurant.nombre,
        category: restaurant.categoria,
        isEco: restaurant.esEco,
        zone: { id: restaurant.zona.id, name: restaurant.zona.nombreBarrio },
      }));
    },
  };
}
