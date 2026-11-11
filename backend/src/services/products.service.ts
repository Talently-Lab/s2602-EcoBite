import { Prisma } from '../generated/prisma/client';
import type { PrismaClient } from '../generated/prisma/client';
import { HttpError } from '../lib/http-error';
import { paginationArgs, paginationMeta, type Pagination } from '../lib/pagination';
import type { validateProduct } from '../lib/validation';

const productSelect = {
  id: true, nombre: true, categoriaComida: true, precio: true, disponible: true,
  empaques: {
    orderBy: [{ empaqueId: 'asc' }] as Prisma.ProductoEmpaqueOrderByWithRelationInput[],
    select: {
      envasesPorUnidad: true,
      empaque: { select: { id: true, nombreEnvase: true } },
    },
  },
} satisfies Prisma.ProductoSelect;

type ProductRow = Prisma.ProductoGetPayload<{ select: typeof productSelect }>;
type ProductInput = ReturnType<typeof validateProduct>;

// Mirrors the public menu shape in restaurants.service.ts and adds the
// configured packagings, so the frontend consumes a single product shape.
function toProductResponse(row: ProductRow) {
  return {
    id: row.id,
    name: row.nombre,
    category: row.categoriaComida,
    price: Number(row.precio),
    available: row.disponible,
    packagings: row.empaques.map((join) => ({
      id: join.empaque.id,
      name: join.empaque.nombreEnvase,
      unitsPerPackage: join.envasesPorUnidad,
    })),
  };
}

export function createProductService(
  db: Pick<PrismaClient, 'usuario' | 'empaque' | 'producto'>,
) {
  // The role check already ran in requireRole; here the account must also be
  // linked to a restaurant that is allowed to operate (approved and activo).
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
    async listPackagings() {
      const packagings = await db.empaque.findMany({
        orderBy: [{ nombreEnvase: 'asc' }, { id: 'asc' }],
        select: {
          id: true, nombreEnvase: true, materialTradicional: true,
          materialEcobite: true, gramosPlasticoEvitados: true, usoHabitual: true,
        },
      });
      return packagings.map((packaging) => ({
        id: packaging.id,
        name: packaging.nombreEnvase,
        traditionalMaterial: packaging.materialTradicional,
        ecoMaterial: packaging.materialEcobite,
        gramsPlasticAvoided: Number(packaging.gramosPlasticoEvitados),
        usualUse: packaging.usoHabitual,
      }));
    },

    async create(userId: string, input: ProductInput) {
      const restauranteId = await requireOperableRestaurant(userId);
      const packagingIds = input.packagings.map((item) => item.packagingId);
      const found = await db.empaque.findMany({
        where: { id: { in: packagingIds } },
        select: { id: true },
      });
      if (found.length !== packagingIds.length) {
        throw new HttpError(400, 'Uno o más envases no existen.');
      }
      // The dish and its producto_empaque rows commit as a single write.
      const product = await db.producto.create({
        data: {
          restauranteId,
          nombre: input.name,
          categoriaComida: input.foodCategory,
          precio: input.price,
          disponible: input.available,
          empaques: {
            create: input.packagings.map((item) => ({
              empaqueId: item.packagingId,
              envasesPorUnidad: item.unitsPerPackage,
            })),
          },
        },
        select: productSelect,
      });
      return toProductResponse(product);
    },

    async listMine(userId: string, pagination: Pagination) {
      const restauranteId = await requireOperableRestaurant(userId);
      const where: Prisma.ProductoWhereInput = { restauranteId };
      const [products, total] = await Promise.all([
        db.producto.findMany({
          where,
          orderBy: [{ fechaCreacion: 'desc' }, { id: 'asc' }],
          ...paginationArgs(pagination),
          select: productSelect,
        }),
        db.producto.count({ where }),
      ]);
      return {
        data: products.map(toProductResponse),
        pagination: paginationMeta(total, pagination),
      };
    },
  };
}
