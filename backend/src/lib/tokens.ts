import jwt from 'jsonwebtoken';
import { HttpError } from './http-error';

const issuer = 'ecobite-api';
const audience = 'ecobite-customer';
export const tokenLifetimeSeconds = 3600;

export function createToken(userId: string, secret: string): string {
  return jwt.sign({}, secret, {
    algorithm: 'HS256',
    subject: userId,
    issuer,
    audience,
    expiresIn: tokenLifetimeSeconds,
  });
}

export function verifyToken(token: string, secret: string): string {
  try {
    const payload = jwt.verify(token, secret, { algorithms: ['HS256'], issuer, audience });
    if (typeof payload === 'string' || typeof payload.sub !== 'string' ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(payload.sub) ||
        typeof payload.exp !== 'number') {
      throw new Error('Invalid claims');
    }
    return payload.sub;
  } catch {
    throw new HttpError(401, 'Sesión inválida o vencida.');
  }
}
