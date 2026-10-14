import type { ErrorRequestHandler } from 'express';
import { HttpError } from '../lib/http-error';

export const handleError: ErrorRequestHandler = (error: unknown, _req, res, next) => {
  if (res.headersSent) return next(error);
  if (error instanceof HttpError) {
    res.status(error.status).json({ error: error.message });
    return;
  }
  const code = error && typeof error === 'object' && 'code' in error ? error.code : undefined;
  if (['P1001', 'P1002', 'P1008', 'P1017', 'P2024'].includes(String(code))) {
    res.status(503).json({ error: 'Servicio temporalmente no disponible.' });
    return;
  }
  const type = error && typeof error === 'object' && 'type' in error ? error.type : undefined;
  if (type === 'entity.too.large') {
    res.status(413).json({ error: 'El cuerpo de la solicitud es demasiado grande.' });
    return;
  }
  if (type === 'entity.parse.failed') {
    res.status(400).json({ error: 'JSON inválido.' });
    return;
  }
  if (type === 'encoding.unsupported' || type === 'charset.unsupported') {
    res.status(415).json({ error: 'Codificación no admitida.' });
    return;
  }
  // Do not log request bodies or Prisma errors containing submitted data.
  console.error('Error interno de API:', error instanceof Error ? error.name : 'UnknownError');
  res.status(500).json({ error: 'Error interno del servidor.' });
};
