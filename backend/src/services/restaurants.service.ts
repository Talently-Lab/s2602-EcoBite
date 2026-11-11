import { Prisma } from '../generated/prisma/client';
import type { PrismaClient } from '../generated/prisma/client';
import { categoriaLabels } from '../lib/categories';
import { HttpError } from '../lib/http-error';
import { isUuid } from '../lib/validation';

// The restaurant sees its full incoming queue, so the select adds the customer
// name (never the email) and drops the per-item impact fields of the customer
// order shape in orders.service.ts.
const restaurantOrderSelect = {
  id: true, estado: true, fechaCreacion: true, direccionEntrega: true,
  tipoTransporte: true, montoTotal: true,
  usuario: { select: { nombreCompleto: true } },
  zonaDestino: { select: { id: true, nombreBarrio: true } },
  detalles: {
    orderBy: [{ productoNombre: 'asc' }, { id: 'asc' }] as Prisma.DetalleOrderByWithRelationInput[],
    select: {
      productoId: true, productoNombre: true, cantidad: true, precioUnitario: true,
    },
  },
} satisfies Prisma.PedidoSelect;

type RestaurantOrderRow = Prisma.PedidoGetPayload<{ select: typeof restaurantOrderSelect }>;

function toRestaurantOrderResponse(order: RestaurantOrderRow) {
  return {
    id: order.id,
    status: order.estado,
    createdAt: order.fechaCreacion,
    customer: { name: order.usuario.nombreCompleto },
    deliveryAddress: order.direccionEntrega,
    destinationZone: { id: order.zonaDestino.id, name: order.zonaDestino.nombreBarrio },
    transportType: order.tipoTransporte,
    total: Number(order.montoTotal),
    items: order.detalles.map((item) => ({
      productId: item.productoId,
      name: item.productoNombre,
      quantity: item.cantidad,
      unitPrice: Number(item.precioUnitario),
      subtotal: Number(item.precioUnitario.mul(item.cantidad)),
    })),
  };
}

export function createRestaurantService(
  db: Pick<PrismaClient, 'usuario' | 'restaurante' | 'pedido'>,
) {
  // The role check already ran in requireRole; here the account must also be
  // linked to a restaurant that is allowed to operate (approved and activo).
  // Same rule as products.service.ts.
  async function requireOperableRestaurant(userId: string) {
    const user = await db.usuario.findUnique({
      where: { id: userId },
      select: { restauranteId: true, restaurante: { select: { activo: true } } },
    });
    if (!user?.restauranteId || !user.restaurante?.activo) {
      throw new HttpError(403, 'El restaurante no está habilitado para operar.');
    }
    return user.restauranteId;
  }

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
        category: categoriaLabels[restaurant.categoria],
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
        category: categoriaLabels[restaurant.categoria],
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

    // The owner reads its own record even while inactivo (it needs to see that
    // state), so this resolves the linked restaurant without the activo gate.
    async getMine(userId: string) {
      const user = await db.usuario.findUnique({
        where: { id: userId },
        select: {
          restaurante: {
            select: {
              id: true, nombre: true, direccion: true, email: true,
              categoria: true, esEco: true, activo: true, fechaCreacion: true,
              zona: { select: { id: true, nombreBarrio: true } },
            },
          },
        },
      });
      const restaurant = user?.restaurante;
      if (!restaurant) {
        throw new HttpError(403, 'El restaurante no está habilitado para operar.');
      }
      return {
        id: restaurant.id,
        name: restaurant.nombre,
        address: restaurant.direccion,
        email: restaurant.email,
        category: categoriaLabels[restaurant.categoria],
        isEco: restaurant.esEco,
        active: restaurant.activo,
        zone: { id: restaurant.zona.id, name: restaurant.zona.nombreBarrio },
        createdAt: restaurant.fechaCreacion,
      };
    },

    async listMineOrders(userId: string) {
      const restauranteId = await requireOperableRestaurant(userId);
      const orders = await db.pedido.findMany({
        where: { restauranteId },
        orderBy: [{ fechaCreacion: 'desc' }, { id: 'asc' }],
        select: restaurantOrderSelect,
      });
      return orders.map(toRestaurantOrderResponse);
    },
  };
}
