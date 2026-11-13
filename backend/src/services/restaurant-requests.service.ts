import { Prisma } from '../generated/prisma/client';
import type { PrismaClient } from '../generated/prisma/client';
import type { CategoriaRestaurante } from '../generated/prisma/enums';
import { categoriaLabels } from '../lib/categories';
import { restaurantApprovalEmail, type EmailService } from '../lib/email';
import { HttpError } from '../lib/http-error';
import { paginationArgs, paginationMeta, type Pagination } from '../lib/pagination';
import { isUuid } from '../lib/validation';
import type { validateRequestStatus, validateRestaurantRequest } from '../lib/validation';

const requestSelect = {
  id: true, estado: true, nombreRestaurante: true, direccion: true, email: true, categoria: true,
  fechaAceptacionCompromiso: true, fechaSolicitud: true, fechaRevision: true,
  zona: { select: { id: true, nombreBarrio: true } },
} satisfies Prisma.SolicitudRestauranteSelect;

const adminRequestSelect = {
  ...requestSelect,
  usuario: { select: { id: true, nombreCompleto: true, email: true } },
  adminRevisor: { select: { id: true, nombreCompleto: true } },
} satisfies Prisma.SolicitudRestauranteSelect;

type RequestRow = Prisma.SolicitudRestauranteGetPayload<{ select: typeof requestSelect }>;
type AdminRequestRow = Prisma.SolicitudRestauranteGetPayload<{ select: typeof adminRequestSelect }>;
type RequestInput = ReturnType<typeof validateRestaurantRequest>;
type StatusFilter = ReturnType<typeof validateRequestStatus>;

function toRequestResponse(row: RequestRow) {
  return {
    id: row.id,
    status: row.estado,
    restaurant: {
      name: row.nombreRestaurante,
      address: row.direccion,
      email: row.email,
      category: categoriaLabels[row.categoria],
    },
    zone: { id: row.zona.id, name: row.zona.nombreBarrio },
    commitmentAcceptedAt: row.fechaAceptacionCompromiso,
    submittedAt: row.fechaSolicitud,
    reviewedAt: row.fechaRevision,
  };
}

function toAdminRequestResponse(row: AdminRequestRow) {
  return {
    ...toRequestResponse(row),
    applicant: { id: row.usuario.id, name: row.usuario.nombreCompleto, email: row.usuario.email },
    reviewedBy: row.adminRevisor
      ? { id: row.adminRevisor.id, name: row.adminRevisor.nombreCompleto }
      : null,
  };
}

function isUniqueViolation(error: unknown): boolean {
  return !!error && typeof error === 'object' && 'code' in error && error.code === 'P2002';
}

async function requireActiveUser(db: Pick<Prisma.TransactionClient, 'usuario'>, userId: string) {
  const user = await db.usuario.findUnique({ where: { id: userId }, select: { activo: true } });
  if (!user || !user.activo) throw new HttpError(401, 'Sesión inválida o vencida.');
}

export function createRestaurantRequestService(
  db: Pick<PrismaClient, 'usuario' | 'zona' | 'restaurante' | 'solicitudRestaurante' | '$transaction' | '$executeRaw'>,
  emailService: EmailService,
) {
  return {
    categories() {
      return (Object.entries(categoriaLabels) as [CategoriaRestaurante, string][]).map(
        ([key, label]) => ({ key, label }),
      );
    },

    async submit(userId: string, input: RequestInput) {
      return db.$transaction(async (tx) => {
        // Serialize submissions per applicant so a concurrent duplicate sees the
        // first committed request instead of inserting a second one.
        const lockKey = `restaurant-request|${userId}`;
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${lockKey}, 0))`;
        const zone = await tx.zona.findFirst({
          where: { id: input.zoneId, activo: true },
          select: { id: true },
        });
        if (!zone) throw new HttpError(400, 'La zona seleccionada no está disponible.');
        const existing = await tx.solicitudRestaurante.findFirst({
          where: { usuarioId: userId, estado: { in: ['PENDIENTE', 'APROBADA'] } },
          select: { id: true },
        });
        if (existing) throw new HttpError(409, 'Ya tenés una solicitud pendiente o aprobada.');
        const emailTaken = await tx.restaurante.findFirst({
          where: { email: input.email },
          select: { id: true },
        });
        if (emailTaken) {
          throw new HttpError(409, 'Ya existe un restaurante o solicitud con ese email.');
        }
        try {
          const request = await tx.solicitudRestaurante.create({
            data: {
              usuarioId: userId,
              nombreRestaurante: input.name,
              direccion: input.address,
              email: input.email,
              categoria: input.category,
              zonaId: input.zoneId,
              estado: 'PENDIENTE',
              fechaAceptacionCompromiso: new Date(),
            },
            select: requestSelect,
          });
          return toRequestResponse(request);
        } catch (error) {
          // solicitud_restaurante.email is unique: also blocks a rejected
          // applicant reusing the same email.
          if (isUniqueViolation(error)) {
            throw new HttpError(409, 'Ya existe un restaurante o solicitud con ese email.');
          }
          throw error;
        }
      });
    },

    async mine(userId: string) {
      await requireActiveUser(db, userId);
      const request = await db.solicitudRestaurante.findFirst({
        where: { usuarioId: userId },
        orderBy: [{ fechaSolicitud: 'desc' }, { id: 'asc' }],
        select: requestSelect,
      });
      return request ? toRequestResponse(request) : null;
    },

    async list(status: StatusFilter, pagination: Pagination) {
      const where: Prisma.SolicitudRestauranteWhereInput =
        status === 'TODAS' ? {} : { estado: status };
      const [requests, total] = await Promise.all([
        db.solicitudRestaurante.findMany({
          where,
          orderBy: [{ fechaSolicitud: 'asc' }, { id: 'asc' }],
          ...paginationArgs(pagination),
          select: adminRequestSelect,
        }),
        db.solicitudRestaurante.count({ where }),
      ]);
      return {
        data: requests.map(toAdminRequestResponse),
        pagination: paginationMeta(total, pagination),
      };
    },

    async getById(id: string) {
      if (!isUuid(id)) throw new HttpError(404, 'Solicitud no encontrada.');
      const request = await db.solicitudRestaurante.findUnique({
        where: { id },
        select: adminRequestSelect,
      });
      if (!request) throw new HttpError(404, 'Solicitud no encontrada.');
      return toAdminRequestResponse(request);
    },

    async approve(id: string, adminUserId: string) {
      if (!isUuid(id)) throw new HttpError(404, 'Solicitud no encontrada.');
      const approved = await db.$transaction(async (tx) => {
        const solicitud = await tx.solicitudRestaurante.findUnique({
          where: { id },
          select: {
            id: true, usuarioId: true, nombreRestaurante: true, direccion: true,
            email: true, categoria: true, zonaId: true,
          },
        });
        if (!solicitud) throw new HttpError(404, 'Solicitud no encontrada.');
        // Conditional update: if two admins review at once, only one wins.
        const updated = await tx.solicitudRestaurante.updateMany({
          where: { id, estado: 'PENDIENTE' },
          data: { estado: 'APROBADA', fechaRevision: new Date(), adminRevisorId: adminUserId },
        });
        if (updated.count !== 1) throw new HttpError(409, 'La solicitud ya fue revisada.');
        const applicant = await tx.usuario.findUnique({
          where: { id: solicitud.usuarioId },
          select: { activo: true, rol: true },
        });
        if (!applicant || !applicant.activo || applicant.rol !== 'CLIENTE') {
          throw new HttpError(409, 'El solicitante no puede ser habilitado como restaurante.');
        }
        let restaurante;
        try {
          restaurante = await tx.restaurante.create({
            data: {
              nombre: solicitud.nombreRestaurante,
              direccion: solicitud.direccion,
              categoria: solicitud.categoria,
              zonaId: solicitud.zonaId,
              email: solicitud.email,
              activo: true,
              esEco: true,
            },
            select: { id: true },
          });
        } catch (error) {
          if (isUniqueViolation(error)) {
            throw new HttpError(409, 'Ya existe un restaurante con ese email.');
          }
          throw error;
        }
        await tx.usuario.update({
          where: { id: solicitud.usuarioId },
          data: { rol: 'RESTAURANTE_ADMIN', restauranteId: restaurante.id },
        });
        const request = await tx.solicitudRestaurante.findUnique({
          where: { id },
          select: adminRequestSelect,
        });
        return toAdminRequestResponse(request!);
      });
      // El correo es fire-and-forget: la aprobación ya quedó confirmada y la
      // respuesta nunca espera ni depende del proveedor de email.
      const copy = restaurantApprovalEmail(approved.restaurant.name);
      void emailService.send({ to: approved.restaurant.email, subject: copy.subject, text: copy.text })
        .catch((error) => console.error('[email] approval send failed:', error));
      return approved;
    },

    async reject(id: string, adminUserId: string) {
      if (!isUuid(id)) throw new HttpError(404, 'Solicitud no encontrada.');
      return db.$transaction(async (tx) => {
        const exists = await tx.solicitudRestaurante.findUnique({
          where: { id },
          select: { id: true },
        });
        if (!exists) throw new HttpError(404, 'Solicitud no encontrada.');
        const updated = await tx.solicitudRestaurante.updateMany({
          where: { id, estado: 'PENDIENTE' },
          data: { estado: 'RECHAZADA', fechaRevision: new Date(), adminRevisorId: adminUserId },
        });
        if (updated.count !== 1) throw new HttpError(409, 'La solicitud ya fue revisada.');
        const request = await tx.solicitudRestaurante.findUnique({
          where: { id },
          select: adminRequestSelect,
        });
        return toAdminRequestResponse(request!);
      });
    },
  };
}
