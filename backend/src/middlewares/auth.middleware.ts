import type { RequestHandler } from 'express';
import type { PrismaClient, RolUsuario } from '../generated/prisma/client';
import { HttpError } from '../lib/http-error';
import { verifyToken } from '../lib/tokens';

export function authenticate(secret: string): RequestHandler {
  return (req, res, next) => {
    const match = /^Bearer ([^\s]+)$/i.exec(req.get('Authorization') ?? '');
    if (!match) throw new HttpError(401, 'Se requiere un token Bearer.');
    res.locals.userId = verifyToken(match[1], secret);
    next();
  };
}

export function requireRole(db: Pick<PrismaClient, 'usuario'>, role: RolUsuario): RequestHandler {
  return async (_req, res, next) => {
    const user = await db.usuario.findUnique({
      where: { id: res.locals.userId },
      select: { activo: true, rol: true },
    });
    if (!user || !user.activo) throw new HttpError(401, 'Sesión inválida o vencida.');
    if (user.rol !== role) {
      throw new HttpError(403, 'No tenés permisos para acceder a este recurso.');
    }
    next();
  };
}
