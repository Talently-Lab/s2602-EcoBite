import { z } from 'zod';
import { HttpError } from './http-error';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const noControlChars = /^[^\u0000-\u001f\u007f]+$/;

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && uuidPattern.test(value);
}

function bodyObject(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new HttpError(400, 'El cuerpo debe ser un objeto JSON.');
  }
  return body as Record<string, unknown>;
}

function parse<T>(schema: z.ZodType<T>, value: unknown, message: string): T {
  const result = schema.safeParse(value);
  if (!result.success) throw new HttpError(400, message);
  return result.data;
}

const uuid = z.string().regex(uuidPattern);
const trimmedText = (max: number) => z.string().trim().min(1).max(max).regex(noControlChars);
const credentialsMessage =
  'Email y contraseña válidos son obligatorios (máximo 72 bytes para la contraseña).';
const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().max(254).regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  password: z.string().min(1).refine((value) => Buffer.byteLength(value, 'utf8') <= 72),
});

export function validateCredentials(body: unknown) {
  const input = bodyObject(body);
  return parse(credentialsSchema, input, credentialsMessage);
}

export function validateRegistration(body: unknown) {
  const input = bodyObject(body);
  const credentials = parse(credentialsSchema, input, credentialsMessage);
  const name = parse(
    trimmedText(120),
    input.name,
    'El nombre es obligatorio y debe tener como máximo 120 caracteres.',
  );
  if (credentials.password.length < 8) {
    throw new HttpError(400, 'La contraseña debe tener al menos 8 caracteres.');
  }
  parse(
    z.strictObject({ name: z.unknown(), email: z.unknown(), password: z.unknown() }),
    input,
    'Solo se permiten los campos name, email y password.',
  );
  return { name, ...credentials };
}

const requestCategories = ['COMIDA_SALUDABLE', 'COMIDA_DE_ESTACION', 'COMIDA_VEGANA', 'COMIDA_CASERA'] as const;

export function validateRestaurantRequest(body: unknown) {
  const input = bodyObject(body);
  parse(
    z.strictObject({
      name: z.unknown(),
      category: z.unknown(),
      zoneId: z.unknown(),
      address: z.unknown(),
      email: z.unknown(),
      commitmentAccepted: z.unknown(),
    }),
    input,
    'Solo se permiten los campos name, category, zoneId, address, email y commitmentAccepted.',
  );
  const name = parse(
    trimmedText(120),
    input.name,
    'El nombre del restaurante es obligatorio y debe tener como máximo 120 caracteres.',
  );
  const category = parse(
    z.enum(requestCategories),
    input.category,
    `category debe ser una de: ${requestCategories.join(', ')}.`,
  );
  const zoneId = parse(uuid, input.zoneId, 'zoneId debe ser un UUID válido.');
  const address = parse(
    trimmedText(200),
    input.address,
    'La dirección del restaurante es obligatoria y debe tener como máximo 200 caracteres.',
  );
  const email = parse(
    credentialsSchema.shape.email,
    input.email,
    'El email del restaurante debe ser válido.',
  );
  parse(
    z.literal(true),
    input.commitmentAccepted,
    'Debés aceptar el compromiso de buenas prácticas para enviar la solicitud.',
  );
  return { name, category, zoneId, address, email };
}

const requestStatuses = ['PENDIENTE', 'APROBADA', 'RECHAZADA', 'TODAS'] as const;

export function validateRequestStatus(value: unknown) {
  return parse(
    z.enum(requestStatuses),
    value ?? 'PENDIENTE',
    `status debe ser una de: ${requestStatuses.join(', ')}.`,
  );
}

export function validateEmptyBody(body: unknown) {
  const empty = body === undefined || body === null ||
    (typeof body === 'object' && !Array.isArray(body) && Object.keys(body).length === 0);
  if (!empty) throw new HttpError(400, 'Esta acción no acepta campos.');
}

export function validateOrder(body: unknown) {
  const input = bodyObject(body);
  parse(
    z.strictObject({
      restaurantId: z.unknown().optional(),
      destinationZoneId: z.unknown().optional(),
      deliveryAddress: z.unknown().optional(),
      transportType: z.unknown().optional(),
      items: z.unknown().optional(),
    }),
    input,
    'Solo se permiten los campos restaurantId, destinationZoneId, deliveryAddress, transportType e items.',
  );
  const ids = parse(
    z.object({ restaurantId: uuid, destinationZoneId: uuid }),
    input,
    'restaurantId y destinationZoneId deben ser UUID válidos.',
  );
  const deliveryAddress = parse(
    trimmedText(200),
    input.deliveryAddress,
    'La dirección de entrega es obligatoria y debe tener como máximo 200 caracteres.',
  );
  const transportType = parse(
    z.enum(['BICICLETA', 'VEHICULO_ELECTRICO']),
    input.transportType,
    'transportType debe ser BICICLETA o VEHICULO_ELECTRICO.',
  );
  const itemsMessage =
    'items debe tener entre 1 y 50 productos con productId UUID y quantity entera entre 1 y 99, sin repetidos.';
  const items = parse(
    z.array(
      z.strictObject({
        productId: uuid,
        quantity: z.number().int().min(1).max(99),
      }),
    ).min(1).max(50),
    input.items,
    itemsMessage,
  );
  if (new Set(items.map((item) => item.productId)).size !== items.length) {
    throw new HttpError(400, itemsMessage);
  }
  return {
    restaurantId: ids.restaurantId,
    destinationZoneId: ids.destinationZoneId,
    deliveryAddress,
    transportType,
    items,
  };
}
