import type { PrismaClient } from '../generated/prisma/client';
import { HttpError } from '../lib/http-error';
import { isUuid } from '../lib/validation';

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

    async getById(id: string) {
      if (!isUuid(id)) throw new HttpError(404, 'Restaurante no encontrado.');
      const restaurant = await db.restaurante.findFirst({
        where: { id, activo: true, esEco: true },
        select: {
          id: true, nombre: true, categoria: true, esEco: true,
          zona: { select: { id: true, nombreBarrio: true } },
          productos: {
            where: { disponible: true },
            orderBy: [{ nombre: 'asc' }, { id: 'asc' }],
            select: { id: true, nombre: true, categoriaComida: true, precio: true, disponible: true },
          },
        },
      });
      if (!restaurant) throw new HttpError(404, 'Restaurante no encontrado.');
      return {
        id: restaurant.id,
        name: restaurant.nombre,
        category: restaurant.categoria,
        isEco: restaurant.esEco,
        zone: { id: restaurant.zona.id, name: restaurant.zona.nombreBarrio },
        products: restaurant.productos.map((product) => ({
          id: product.id,
          name: product.nombre,
          category: product.categoriaComida,
          price: Number(product.precio),
          available: product.disponible,
        })),
      };
    },
  };
}
