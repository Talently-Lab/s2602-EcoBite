import { HttpError } from './http-error';

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function bodyObject(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new HttpError(400, 'El cuerpo debe ser un objeto JSON.');
  }
  return body as Record<string, unknown>;
}

export function validateCredentials(body: unknown) {
  const input = bodyObject(body);
  const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
  const password = input.password;
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      typeof password !== 'string' || !password || Buffer.byteLength(password, 'utf8') > 72) {
    throw new HttpError(400, 'Email y contraseña válidos son obligatorios (máximo 72 bytes para la contraseña).');
  }
  return { email, password };
}

export function validateRegistration(body: unknown) {
  const input = bodyObject(body);
  const credentials = validateCredentials(input);
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  if (!name || name.length > 120 || /[\u0000-\u001f\u007f]/.test(name)) {
    throw new HttpError(400, 'El nombre es obligatorio y debe tener como máximo 120 caracteres.');
  }
  if (credentials.password.length < 8) {
    throw new HttpError(400, 'La contraseña debe tener al menos 8 caracteres.');
  }
  if (Object.keys(input).some((key) => !['name', 'email', 'password'].includes(key))) {
    throw new HttpError(400, 'Solo se permiten los campos name, email y password.');
  }
  return { name, ...credentials };
}

export function validateOrder(body: unknown) {
  const input = bodyObject(body);
  if (Object.keys(input).some((key) =>
    !['restaurantId', 'destinationZoneId', 'deliveryAddress', 'transportType', 'items'].includes(key))) {
    throw new HttpError(400, 'Solo se permiten los campos restaurantId, destinationZoneId, deliveryAddress, transportType e items.');
  }
  if (!isUuid(input.restaurantId) || !isUuid(input.destinationZoneId)) {
    throw new HttpError(400, 'restaurantId y destinationZoneId deben ser UUID válidos.');
  }
  const deliveryAddress = typeof input.deliveryAddress === 'string' ? input.deliveryAddress.trim() : '';
  if (!deliveryAddress || deliveryAddress.length > 200 || /[\u0000-\u001f\u007f]/.test(deliveryAddress)) {
    throw new HttpError(400, 'La dirección de entrega es obligatoria y debe tener como máximo 200 caracteres.');
  }
  const transportType = input.transportType;
  if (transportType !== 'BICICLETA' && transportType !== 'VEHICULO_ELECTRICO') {
    throw new HttpError(400, 'transportType debe ser BICICLETA o VEHICULO_ELECTRICO.');
  }
  const rows = Array.isArray(input.items) ? input.items : [];
  const valid = rows.length >= 1 && rows.length <= 50 && rows.every((item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return false;
    const record = item as Record<string, unknown>;
    return Object.keys(record).length === 2 && isUuid(record.productId) &&
      typeof record.quantity === 'number' && Number.isInteger(record.quantity) &&
      record.quantity >= 1 && record.quantity <= 99;
  });
  if (!valid || new Set(rows.map((item) => (item as Record<string, unknown>).productId)).size !== rows.length) {
    throw new HttpError(400, 'items debe tener entre 1 y 50 productos con productId UUID y quantity entera entre 1 y 99, sin repetidos.');
  }
  return {
    restaurantId: input.restaurantId as string,
    destinationZoneId: input.destinationZoneId as string,
    deliveryAddress,
    transportType: transportType as 'BICICLETA' | 'VEHICULO_ELECTRICO',
    items: rows.map((item) => {
      const record = item as { productId: string; quantity: number };
      return { productId: record.productId, quantity: record.quantity };
    }),
  };
}
