import type { PrismaClient } from '../generated/prisma/client';
import { HttpError } from '../lib/http-error';

export function createHealthService(db: Pick<PrismaClient, '$queryRaw'>, timeoutMs = 2000) {
  const timeout = Symbol('timeout');
  return {
    async check() {
      let timer: NodeJS.Timeout | undefined;
      try {
        await Promise.race([
          db.$queryRaw`SELECT 1`,
          new Promise<never>((_resolve, reject) => {
            timer = setTimeout(() => reject(timeout), timeoutMs);
          }),
        ]);
        return { status: 'ok' as const };
      } catch (error) {
        const detail = error === timeout ? `timeout de ${timeoutMs}ms`
          : error && typeof error === 'object' && 'code' in error ? String(error.code)
          : error instanceof Error ? error.name : 'UnknownError';
        console.error('Health check falló:', detail);
        throw new HttpError(503, 'Servicio temporalmente no disponible.');
      } finally {
        clearTimeout(timer);
      }
    },
  };
}
