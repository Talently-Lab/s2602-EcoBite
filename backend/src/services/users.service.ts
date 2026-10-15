import bcrypt from 'bcrypt';
import type { Prisma, PrismaClient } from '../generated/prisma/client';
import { HttpError } from '../lib/http-error';
import { createToken, tokenLifetimeSeconds } from '../lib/tokens';
import type { validateCredentials, validateRegistration } from '../lib/validation';

const publicUserSelect = {
  id: true, nombreCompleto: true, email: true, rol: true, fechaRegistro: true,
} as const;

type PublicUser = Prisma.UsuarioGetPayload<{ select: typeof publicUserSelect }>;

function userResponse(user: PublicUser) {
  return { id: user.id, name: user.nombreCompleto, email: user.email, role: user.rol, createdAt: user.fechaRegistro };
}

export function createUserService(db: Pick<PrismaClient, 'usuario'>, jwtSecret: string) {
  return {
    async register(input: ReturnType<typeof validateRegistration>) {
      const passwordHash = await bcrypt.hash(input.password, 12);
      try {
        const user = await db.usuario.create({
          data: { nombreCompleto: input.name, email: input.email, passwordHash, rol: 'CLIENTE' },
          select: publicUserSelect,
        });
        return userResponse(user);
      } catch (error) {
        // The unique constraint also covers concurrent registrations.
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
          throw new HttpError(409, 'No se pudo registrar ese email.');
        }
        throw error;
      }
    },

    async login(input: ReturnType<typeof validateCredentials>) {
      const user = await db.usuario.findUnique({
        where: { email: input.email },
        select: { ...publicUserSelect, activo: true, passwordHash: true },
      });
      let matches = false;
      // Spend a bcrypt work factor even when the email does not exist.
      if (user) {
        matches = await bcrypt.compare(input.password, user.passwordHash);
      } else {
        await bcrypt.hash(input.password, 12);
      }
      if (!user || !matches || !user.activo) {
        throw new HttpError(401, 'Email o contraseña incorrectos.');
      }
      return {
        accessToken: createToken(user.id, jwtSecret),
        tokenType: 'Bearer',
        expiresIn: tokenLifetimeSeconds,
        user: userResponse(user),
      };
    },

    async currentUser(id: string) {
      const user = await db.usuario.findUnique({
        where: { id },
        select: { ...publicUserSelect, activo: true },
      });
      if (!user || !user.activo) throw new HttpError(401, 'Sesión inválida o vencida.');
      return userResponse(user);
    },
  };
}
