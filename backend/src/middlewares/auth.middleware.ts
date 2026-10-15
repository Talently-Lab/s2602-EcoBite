import type { RequestHandler } from 'express';
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
