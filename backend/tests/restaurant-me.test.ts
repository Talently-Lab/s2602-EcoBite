import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { once } from 'node:events';
import type { Server } from 'node:http';
import { test } from 'node:test';
import { createApp } from '../src/app';
import { Prisma } from '../src/generated/prisma/client';
import type { PrismaClient } from '../src/generated/prisma/client';
import { createToken } from '../src/lib/tokens';

const secret = randomBytes(32).toString('hex');
const ownerId = randomUUID();
const otherOwnerId = randomUUID();
const emptyOwnerId = randomUUID();
const orphanAdminId = randomUUID();
const ghostAdminId = randomUUID();
const inactiveOwnerId = randomUUID();
const clientId = randomUUID();
const platformAdminId = randomUUID();
const customerId = randomUUID();
const otherCustomerId = randomUUID();
const restaurantId = randomUUID();
const otherRestaurantId = randomUUID();
const emptyRestaurantId = randomUUID();
const inactiveRestaurantId = randomUUID();
// ghostAdminId points here, but no row exists: the "missing restaurant" case.
const ghostRestaurantId = randomUUID();
const zone = { id: randomUUID(), nombreBarrio: 'Palermo' };
const otherZone = { id: randomUUID(), nombreBarrio: 'Caballito' };
const productA = randomUUID();
const productB = randomUUID();

function fixture() {
  const calls: { method: string; input: any }[] = [];
  const users = new Map<string, any>([
    [ownerId, {
      id: ownerId, nombreCompleto: 'Dueño Verde', email: 'duenio@example.test',
      rol: 'RESTAURANTE_ADMIN', activo: true, passwordHash: 'hash-must-not-leak',
      restauranteId: restaurantId,
    }],
    [otherOwnerId, {
      id: otherOwnerId, nombreCompleto: 'Otro Dueño', email: 'otro.duenio@example.test',
      rol: 'RESTAURANTE_ADMIN', activo: true, passwordHash: 'hash-must-not-leak',
      restauranteId: otherRestaurantId,
    }],
    [emptyOwnerId, {
      id: emptyOwnerId, nombreCompleto: 'Dueño sin pedidos', email: 'vacio.duenio@example.test',
      rol: 'RESTAURANTE_ADMIN', activo: true, passwordHash: 'hash-must-not-leak',
      restauranteId: emptyRestaurantId,
    }],
    [orphanAdminId, {
      id: orphanAdminId, nombreCompleto: 'Admin sin local', email: 'sin.local@example.test',
      rol: 'RESTAURANTE_ADMIN', activo: true, passwordHash: 'hash-must-not-leak', restauranteId: null,
    }],
    [ghostAdminId, {
      id: ghostAdminId, nombreCompleto: 'Admin sin fila', email: 'sin.fila@example.test',
      rol: 'RESTAURANTE_ADMIN', activo: true, passwordHash: 'hash-must-not-leak',
      restauranteId: ghostRestaurantId,
    }],
    [inactiveOwnerId, {
      id: inactiveOwnerId, nombreCompleto: 'Dueño pendiente', email: 'pendiente@example.test',
      rol: 'RESTAURANTE_ADMIN', activo: true, passwordHash: 'hash-must-not-leak',
      restauranteId: inactiveRestaurantId,
    }],
    [clientId, {
      id: clientId, nombreCompleto: 'Cliente de prueba', email: 'cliente@example.test',
      rol: 'CLIENTE', activo: true, passwordHash: 'hash-must-not-leak', restauranteId: null,
    }],
    [platformAdminId, {
      id: platformAdminId, nombreCompleto: 'Admin Plataforma', email: 'admin@example.test',
      rol: 'ADMIN_PLATAFORMA', activo: true, passwordHash: 'hash-must-not-leak', restauranteId: null,
    }],
    [customerId, {
      id: customerId, nombreCompleto: 'Ana Cliente', email: 'ana@example.test',
      rol: 'CLIENTE', activo: true, passwordHash: 'hash-must-not-leak', restauranteId: null,
    }],
    [otherCustomerId, {
      id: otherCustomerId, nombreCompleto: 'Beto Cliente', email: 'beto@example.test',
      rol: 'CLIENTE', activo: true, passwordHash: 'hash-must-not-leak', restauranteId: null,
    }],
  ]);
  const zonas = [zone, otherZone];
  const restaurantes = [
    {
      id: restaurantId, nombre: 'Verde Bistró', direccion: 'Av. Santa Fe 1234',
      email: 'local@example.test', categoria: 'COMIDA_SALUDABLE',
      esEco: true, activo: true, zonaId: zone.id,
      fechaCreacion: new Date('2026-01-15T10:00:00.000Z'),
    },
    {
      id: otherRestaurantId, nombre: 'Otro local', direccion: 'Av. Rivadavia 4000',
      email: 'otro@example.test', categoria: 'COMIDA_VEGANA',
      esEco: true, activo: true, zonaId: zone.id,
      fechaCreacion: new Date('2026-01-10T10:00:00.000Z'),
    },
    {
      id: emptyRestaurantId, nombre: 'Local sin pedidos', direccion: 'Av. Córdoba 900',
      email: 'vacio@example.test', categoria: 'COMIDA_CASERA',
      esEco: true, activo: true, zonaId: otherZone.id,
      fechaCreacion: new Date('2026-01-05T10:00:00.000Z'),
    },
    {
      id: inactiveRestaurantId, nombre: 'Local pendiente', direccion: 'Av. Belgrano 1500',
      email: 'pendiente@example.test', categoria: 'COMIDA_DE_ESTACION',
      esEco: true, activo: false, zonaId: zone.id,
      fechaCreacion: new Date('2026-01-01T10:00:00.000Z'),
    },
  ];
  const pedidos: any[] = [
    {
      id: 'dd5b017d-9b09-4f4e-9f6a-1e0d8f9e0001', usuarioId: customerId,
      restauranteId: restaurantId, estado: 'COMPLETADO',
      fechaCreacion: new Date('2026-02-01T12:00:00.000Z'),
      direccionEntrega: 'Av. Corrientes 1234', tipoTransporte: 'BICICLETA',
      montoTotal: new Prisma.Decimal('25000.00'), zonaDestinoId: zone.id,
      detalles: [{
        id: randomUUID(), productoId: productA, productoNombre: 'Bowl andino',
        cantidad: 2, precioUnitario: new Prisma.Decimal('12500.00'),
      }],
    },
    {
      id: 'dd5b017d-9b09-4f4e-9f6a-1e0d8f9e0003', usuarioId: customerId,
      restauranteId: restaurantId, estado: 'CANCELADO',
      fechaCreacion: new Date('2026-02-05T09:00:00.000Z'),
      direccionEntrega: 'Av. Corrientes 1234', tipoTransporte: 'BICICLETA',
      montoTotal: new Prisma.Decimal('12500.00'), zonaDestinoId: zone.id,
      detalles: [{
        id: randomUUID(), productoId: productA, productoNombre: 'Bowl andino',
        cantidad: 1, precioUnitario: new Prisma.Decimal('12500.00'),
      }],
    },
    {
      id: 'dd5b017d-9b09-4f4e-9f6a-1e0d8f9e0002', usuarioId: otherCustomerId,
      restauranteId: restaurantId, estado: 'EN_PREPARACION',
      fechaCreacion: new Date('2026-02-10T15:30:00.000Z'),
      direccionEntrega: 'Honduras 4500', tipoTransporte: 'VEHICULO_ELECTRICO',
      montoTotal: new Prisma.Decimal('36800.00'), zonaDestinoId: otherZone.id,
      // Stored out of name order so the service-side detalle ordering shows.
      detalles: [
        {
          id: randomUUID(), productoId: productB, productoNombre: 'Wrap verde',
          cantidad: 1, precioUnitario: new Prisma.Decimal('11800.00'),
        },
        {
          id: randomUUID(), productoId: productA, productoNombre: 'Bowl andino',
          cantidad: 2, precioUnitario: new Prisma.Decimal('12500.00'),
        },
      ],
    },
    {
      id: 'dd5b017d-9b09-4f4e-9f6a-1e0d8f9e0004', usuarioId: customerId,
      restauranteId: otherRestaurantId, estado: 'PENDIENTE',
      fechaCreacion: new Date('2026-02-12T18:00:00.000Z'),
      direccionEntrega: 'Av. Corrientes 1234', tipoTransporte: 'BICICLETA',
      montoTotal: new Prisma.Decimal('5000.00'), zonaDestinoId: zone.id,
      detalles: [{
        id: randomUUID(), productoId: productB, productoNombre: 'Menú ajeno',
        cantidad: 1, precioUnitario: new Prisma.Decimal('5000.00'),
      }],
    },
  ];

  function matches(row: any, where: any): boolean {
    if (!where) return true;
    return Object.entries(where).every(([key, value]) => {
      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        const range = value as Record<string, unknown>;
        if ('in' in range) return (range.in as unknown[]).includes(row[key]);
        if ('gte' in range) return row[key] >= range.gte;
      }
      return row[key] === value;
    });
  }

  function sortRows(rows: any[], orderBy: any): any[] {
    const rules = Array.isArray(orderBy) ? orderBy : orderBy ? [orderBy] : [];
    return [...rows].sort((a, b) => {
      for (const rule of rules) {
        const [field, direction] = Object.entries(rule)[0] as [string, string];
        const left = a[field];
        const right = b[field];
        const order = left instanceof Date && right instanceof Date
          ? left.getTime() - right.getTime()
          : left < right ? -1 : left > right ? 1 : 0;
        if (order !== 0) return direction === 'desc' ? -order : order;
      }
      return 0;
    });
  }

  const zonaOf = (zonaId: string) => zonas.find((row) => row.id === zonaId) ?? null;

  // Returns the full linked row plus its zona, as a nested select would; the
  // service decides which fields leave the process.
  const withLocal = (row: any) => {
    const local = restaurantes.find((item) => item.id === row.restauranteId) ?? null;
    return local ? { ...local, zona: zonaOf(local.zonaId) } : null;
  };

  // Mirrors the include in restaurants.service: customer, destination zone and
  // sorted detalles ride along with each pedido row.
  const withOrderRelations = (row: any) => ({
    ...row,
    usuario: users.get(row.usuarioId) ?? null,
    zonaDestino: zonaOf(row.zonaDestinoId),
    detalles: sortRows(row.detalles ?? [], [{ productoNombre: 'asc' }, { id: 'asc' }]),
  });

  const db = {
    usuario: {
      async findUnique(input: any) {
        calls.push({ method: 'usuario.findUnique', input });
        const row = [...users.values()].find((user) =>
          (input.where.id && user.id === input.where.id) ||
          (input.where.email && user.email === input.where.email)) ?? null;
        if (!row) return null;
        return { ...row, restaurante: withLocal(row) };
      },
    },
    restaurante: {
      async findFirst(input: any) {
        calls.push({ method: 'restaurante.findFirst', input });
        const row = sortRows(
          restaurantes.filter((item) => matches(item, input.where)), input.orderBy)[0] ?? null;
        if (!row) return null;
        return { ...row, zona: zonaOf(row.zonaId), productos: [] };
      },
    },
    pedido: {
      async findMany(input: any) {
        calls.push({ method: 'pedido.findMany', input });
        return sortRows(pedidos.filter((row) => matches(row, input.where)), input.orderBy)
          .map(withOrderRelations);
      },
    },
  };
  return { db: db as unknown as PrismaClient, calls, pedidos };
}

async function serve(run: (url: string, data: ReturnType<typeof fixture>) => Promise<void>) {
  const data = fixture();
  const server: Server = createApp(
    data.db,
    { jwtSecret: secret, corsOrigins: ['http://localhost:5173'], trustProxyHops: 0 })
    .listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  try {
    await run(`http://127.0.0.1:${address.port}/api`, data);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

function get(url: string, token?: string) {
  return fetch(url, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined);
}

const ownerToken = () => createToken(ownerId, secret);

test('GET /restaurants/me requires auth and RESTAURANTE_ADMIN with a linked restaurant', async () => {
  await serve(async (url) => {
    const missing = await get(`${url}/restaurants/me`);
    assert.equal(missing.status, 401);
    assert.deepEqual(await missing.json(), { error: 'Se requiere un token Bearer.' });
    for (const userId of [clientId, platformAdminId]) {
      const response = await get(`${url}/restaurants/me`, createToken(userId, secret));
      assert.equal(response.status, 403, userId);
      assert.deepEqual(await response.json(), {
        error: 'No tenés permisos para acceder a este recurso.',
      });
    }
    // No restauranteId and a restauranteId whose row is missing share the 403.
    for (const userId of [orphanAdminId, ghostAdminId]) {
      const response = await get(`${url}/restaurants/me`, createToken(userId, secret));
      assert.equal(response.status, 403, userId);
      assert.deepEqual(await response.json(), {
        error: 'El restaurante no está habilitado para operar.',
      });
    }
  });
});

test('GET /restaurants/me returns the own record and is not swallowed by /restaurants/:id', async () => {
  await serve(async (url) => {
    const response = await get(`${url}/restaurants/me`, ownerToken());
    assert.equal(response.status, 200);
    const body = await response.json();
    // If "me" were matched as :id the public route would answer 404
    // 'Restaurante no encontrado.' instead of this envelope.
    assert.deepEqual(Object.keys(body), ['restaurant']);
    const restaurant = body.restaurant;
    assert.deepEqual(Object.keys(restaurant).sort(), [
      'active', 'address', 'category', 'createdAt', 'email', 'id', 'isEco', 'name', 'zone',
    ]);
    assert.equal(restaurant.id, restaurantId);
    assert.equal(restaurant.name, 'Verde Bistró');
    assert.equal(restaurant.address, 'Av. Santa Fe 1234');
    assert.equal(restaurant.email, 'local@example.test');
    assert.equal(restaurant.category, 'Comida saludable');
    assert.equal(restaurant.isEco, true);
    assert.equal(restaurant.active, true);
    assert.deepEqual(restaurant.zone, { id: zone.id, name: 'Palermo' });
    assert.equal(restaurant.createdAt, '2026-01-15T10:00:00.000Z');
    assert.equal(JSON.stringify(body).includes('hash-must-not-leak'), false);

    // The public :id route keeps working next to it.
    const detail = await (await get(`${url}/restaurants/${restaurantId}`)).json();
    assert.equal(detail.name, 'Verde Bistró');
  });
});

test('GET /restaurants/me returns the record even while the restaurant is inactive', async () => {
  await serve(async (url) => {
    const response = await get(`${url}/restaurants/me`, createToken(inactiveOwnerId, secret));
    assert.equal(response.status, 200);
    const { restaurant } = await response.json();
    assert.equal(restaurant.id, inactiveRestaurantId);
    assert.equal(restaurant.name, 'Local pendiente');
    assert.equal(restaurant.category, 'Comida de estación');
    assert.equal(restaurant.active, false);
  });
});

test('GET /restaurants/me/orders requires auth, RESTAURANTE_ADMIN and an operable restaurant', async () => {
  await serve(async (url, data) => {
    const missing = await get(`${url}/restaurants/me/orders`);
    assert.equal(missing.status, 401);
    assert.deepEqual(await missing.json(), { error: 'Se requiere un token Bearer.' });
    for (const userId of [clientId, platformAdminId]) {
      const response = await get(`${url}/restaurants/me/orders`, createToken(userId, secret));
      assert.equal(response.status, 403, userId);
      assert.deepEqual(await response.json(), {
        error: 'No tenés permisos para acceder a este recurso.',
      });
    }
    // Unlike /restaurants/me, the queue also requires the local to be activo.
    for (const userId of [orphanAdminId, ghostAdminId, inactiveOwnerId]) {
      const response = await get(`${url}/restaurants/me/orders`, createToken(userId, secret));
      assert.equal(response.status, 403, userId);
      assert.deepEqual(await response.json(), {
        error: 'El restaurante no está habilitado para operar.',
      });
    }
    assert.equal(data.calls.filter((call) => call.method === 'pedido.findMany').length, 0);
  });
});

test('GET /restaurants/me/orders returns the own queue, newest first, without customer PII', async () => {
  await serve(async (url) => {
    const response = await get(`${url}/restaurants/me/orders`, ownerToken());
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.deepEqual(Object.keys(body), ['orders']);
    assert.equal(body.orders.length, 3);

    // Every pedido_estado rides along, newest first; no state filter applies.
    assert.deepEqual(body.orders.map((order: any) => order.status), [
      'EN_PREPARACION', 'CANCELADO', 'COMPLETADO',
    ]);
    assert.deepEqual(
      body.orders.map((order: any) => order.id),
      [
        'dd5b017d-9b09-4f4e-9f6a-1e0d8f9e0002',
        'dd5b017d-9b09-4f4e-9f6a-1e0d8f9e0003',
        'dd5b017d-9b09-4f4e-9f6a-1e0d8f9e0001',
      ],
    );

    const order = body.orders[0];
    assert.deepEqual(Object.keys(order).sort(), [
      'createdAt', 'customer', 'deliveryAddress', 'destinationZone', 'id',
      'items', 'status', 'total', 'transportType',
    ]);
    assert.equal(order.createdAt, '2026-02-10T15:30:00.000Z');
    // Fulfillment needs the customer name; the email stays out.
    assert.deepEqual(order.customer, { name: 'Beto Cliente' });
    assert.equal(order.deliveryAddress, 'Honduras 4500');
    assert.deepEqual(order.destinationZone, { id: otherZone.id, name: 'Caballito' });
    assert.equal(order.transportType, 'VEHICULO_ELECTRICO');
    assert.equal(order.total, 36800);
    assert.equal(typeof order.total, 'number');
    assert.deepEqual(order.items, [
      { productId: productA, name: 'Bowl andino', quantity: 2, unitPrice: 12500, subtotal: 25000 },
      { productId: productB, name: 'Wrap verde', quantity: 1, unitPrice: 11800, subtotal: 11800 },
    ]);
    assert.equal(typeof order.items[0].unitPrice, 'number');
    assert.equal(typeof order.items[0].subtotal, 'number');
    assert.deepEqual(body.orders[2].customer, { name: 'Ana Cliente' });

    const text = JSON.stringify(body);
    for (const leak of ['ana@example.test', 'beto@example.test', 'hash-must-not-leak', 'passwordHash']) {
      assert.equal(text.includes(leak), false, leak);
    }
  });
});

test('GET /restaurants/me/orders never lists other restaurants and tolerates an empty queue', async () => {
  await serve(async (url) => {
    const mine = await (await get(`${url}/restaurants/me/orders`, ownerToken())).json();
    assert.equal(mine.orders.some((order: any) => order.id === 'dd5b017d-9b09-4f4e-9f6a-1e0d8f9e0004'), false);

    const other = await (await get(
      `${url}/restaurants/me/orders`, createToken(otherOwnerId, secret))).json();
    assert.deepEqual(other.orders.map((order: any) => order.id), [
      'dd5b017d-9b09-4f4e-9f6a-1e0d8f9e0004',
    ]);
    assert.deepEqual(other.orders[0].customer, { name: 'Ana Cliente' });

    const empty = await get(`${url}/restaurants/me/orders`, createToken(emptyOwnerId, secret));
    assert.equal(empty.status, 200);
    assert.deepEqual(await empty.json(), { orders: [] });
  });
});
