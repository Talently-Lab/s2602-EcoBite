import { Prisma } from '../generated/prisma/client';
import type { PrismaClient } from '../generated/prisma/client';
import { HttpError } from '../lib/http-error';
import { isUuid } from '../lib/validation';
import type { validateOrder } from '../lib/validation';

export const CO2_KG_POR_KM = new Prisma.Decimal('0.08');

const orderSelect = {
  id: true, estado: true, fechaCreacion: true, direccionEntrega: true, tipoTransporte: true,
  montoTotal: true, distanciaEstimadaKm: true, co2AhorradoKg: true,
  totalEnvasesEvitados: true, gramosPlasticoEvitadosTotal: true,
  restaurante: { select: { id: true, nombre: true } },
  zonaDestino: { select: { id: true, nombreBarrio: true } },
  detalles: {
    orderBy: [{ productoNombre: 'asc' }, { id: 'asc' }] as Prisma.DetalleOrderByWithRelationInput[],
    select: {
      productoId: true, productoNombre: true, cantidad: true, precioUnitario: true,
      envasesItem: true, gramosPlasticoEvitadosItem: true,
    },
  },
} satisfies Prisma.PedidoSelect;

type OrderRow = Prisma.PedidoGetPayload<{ select: typeof orderSelect }>;
type OrderInput = ReturnType<typeof validateOrder>;

function toOrderResponse(order: OrderRow) {
  return {
    id: order.id,
    status: order.estado,
    createdAt: order.fechaCreacion,
    restaurant: { id: order.restaurante.id, name: order.restaurante.nombre },
    destinationZone: { id: order.zonaDestino.id, name: order.zonaDestino.nombreBarrio },
    deliveryAddress: order.direccionEntrega,
    transportType: order.tipoTransporte,
    total: Number(order.montoTotal),
    impact: {
      distanceKm: Number(order.distanciaEstimadaKm),
      co2SavedKg: Number(order.co2AhorradoKg),
      containersAvoided: order.totalEnvasesEvitados,
      plasticAvoidedG: Number(order.gramosPlasticoEvitadosTotal),
    },
    items: order.detalles.map((item) => ({
      productId: item.productoId,
      name: item.productoNombre,
      quantity: item.cantidad,
      unitPrice: Number(item.precioUnitario),
      subtotal: Number(item.precioUnitario.mul(item.cantidad)),
      containersAvoided: item.envasesItem,
      plasticAvoidedG: Number(item.gramosPlasticoEvitadosItem),
    })),
  };
}

async function requireActiveUser(db: Pick<Prisma.TransactionClient, 'usuario'>, userId: string) {
  const user = await db.usuario.findUnique({ where: { id: userId }, select: { activo: true } });
  if (!user || !user.activo) throw new HttpError(401, 'Sesión inválida o vencida.');
}

export function createOrderService(
  db: Pick<PrismaClient, 'usuario' | 'restaurante' | 'zona' | 'producto' | 'pedido' | '$transaction' | '$executeRaw'>,
) {
  return {
    async create(userId: string, input: OrderInput) {
      return db.$transaction(async (tx) => {
        // Serialize identical submissions so a concurrent double-confirm sees the
        // first committed order instead of inserting a duplicate.
        const dedupeKey = [
          'order-confirm', userId, input.restaurantId, input.destinationZoneId,
          input.deliveryAddress, input.transportType,
          ...input.items.map((item) => `${item.productId}:${item.quantity}`).sort(),
        ].join('|');
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${dedupeKey}, 0))`;
        await requireActiveUser(tx, userId);
        const restaurant = await tx.restaurante.findFirst({
          where: { id: input.restaurantId, activo: true, esEco: true },
          select: { id: true, nombre: true },
        });
        if (!restaurant) throw new HttpError(404, 'Restaurante no encontrado.');
        const zone = await tx.zona.findFirst({
          where: { id: input.destinationZoneId, activo: true },
          select: { id: true, nombreBarrio: true, distanciaPromedioKm: true },
        });
        if (!zone) throw new HttpError(400, 'La zona de destino no está disponible.');
        const products = await tx.producto.findMany({
          where: {
            id: { in: input.items.map((item) => item.productId) },
            restauranteId: restaurant.id,
            disponible: true,
          },
          select: {
            id: true, nombre: true, precio: true,
            empaques: {
              select: {
                envasesPorUnidad: true,
                empaque: { select: { gramosPlasticoEvitados: true } },
              },
            },
          },
        });
        if (products.length !== input.items.length) {
          throw new HttpError(400, 'Uno o más productos no están disponibles en este restaurante.');
        }
        if (products.some((product) => product.empaques.length === 0)) {
          throw new HttpError(400, 'Uno o más productos no tienen empaque configurado.');
        }
        const byId = new Map(products.map((product) => [product.id, product]));
        const items = input.items.map((item) => {
          const product = byId.get(item.productId)!;
          const envasesPorUnidad = product.empaques.reduce((sum, pe) => sum + pe.envasesPorUnidad, 0);
          const gramosPorUnidad = product.empaques.reduce(
            (sum, pe) => sum.add(pe.empaque.gramosPlasticoEvitados.mul(pe.envasesPorUnidad)),
            new Prisma.Decimal(0),
          );
          return {
            productoId: product.id,
            productoNombre: product.nombre,
            cantidad: item.quantity,
            precioUnitario: product.precio,
            envasesItem: envasesPorUnidad * item.quantity,
            gramosPlasticoEvitadosItem: gramosPorUnidad.mul(item.quantity),
          };
        });
        const montoTotal = items.reduce(
          (sum, item) => sum.add(item.precioUnitario.mul(item.cantidad)), new Prisma.Decimal(0));
        const totalEnvasesEvitados = items.reduce((sum, item) => sum + item.envasesItem, 0);
        const gramosPlasticoEvitadosTotal = items.reduce(
          (sum, item) => sum.add(item.gramosPlasticoEvitadosItem), new Prisma.Decimal(0));
        const distanciaEstimadaKm = zone.distanciaPromedioKm;
        const co2AhorradoKg = distanciaEstimadaKm.mul(CO2_KG_POR_KM).toDecimalPlaces(3);
        const candidates = await tx.pedido.findMany({
          where: {
            usuarioId: userId,
            restauranteId: restaurant.id,
            zonaDestinoId: zone.id,
            direccionEntrega: input.deliveryAddress,
            tipoTransporte: input.transportType,
            fechaCreacion: { gte: new Date(Date.now() - 60_000) },
          },
          orderBy: { fechaCreacion: 'desc' },
          select: orderSelect,
        });
        const requested = new Map(input.items.map((item) => [item.productId, item.quantity]));
        const existing = candidates.find((order) =>
          order.detalles.length === input.items.length &&
          order.detalles.every((detalle) => requested.get(detalle.productoId) === detalle.cantidad));
        if (existing) return { order: toOrderResponse(existing), created: false };
        const order = await tx.pedido.create({
          data: {
            usuarioId: userId,
            restauranteId: restaurant.id,
            zonaDestinoId: zone.id,
            direccionEntrega: input.deliveryAddress,
            tipoTransporte: input.transportType,
            montoTotal,
            distanciaEstimadaKm,
            totalEnvasesEvitados,
            co2AhorradoKg,
            gramosPlasticoEvitadosTotal,
            estado: 'EN_PREPARACION',
            detalles: { create: items },
          },
          select: orderSelect,
        });
        return { order: toOrderResponse(order), created: true };
      });
    },

    async list(userId: string) {
      await requireActiveUser(db, userId);
      const orders = await db.pedido.findMany({
        where: { usuarioId: userId },
        orderBy: [{ fechaCreacion: 'desc' }, { id: 'asc' }],
        select: orderSelect,
      });
      return orders.map(toOrderResponse);
    },

    async getById(userId: string, id: string) {
      if (!isUuid(id)) throw new HttpError(404, 'Pedido no encontrado.');
      await requireActiveUser(db, userId);
      const order = await db.pedido.findFirst({
        where: { id, usuarioId: userId },
        select: orderSelect,
      });
      if (!order) throw new HttpError(404, 'Pedido no encontrado.');
      return toOrderResponse(order);
    },
  };
}
