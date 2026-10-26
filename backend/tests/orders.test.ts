import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { once } from 'node:events';
import type { Server } from 'node:http';
import { test } from 'node:test';
import { createApp } from '../src/app';
import { Prisma } from '../src/generated/prisma/client';
import type { PrismaClient } from '../src/generated/prisma/client';

const secret = randomBytes(32).toString('hex');
const userId = randomUUID();
const user = {
  id: userId, nombreCompleto: 'Cliente de prueba', email: 'cliente@example.test',
  rol: 'CLIENTE', fechaRegistro: new Date('2026-01-01T00:00:00Z'), activo: true,
};
const registration = { name: 'Cliente de prueba', email: ' Cliente@Example.Test ', password: 'valid-password' };

const zone = {
  id: randomUUID(), nombreBarrio: 'Palermo', comuna: 14, activo: true,
  distanciaPromedioKm: new Prisma.Decimal('4.78'),
};
const inactiveZone = {
  id: randomUUID(), nombreBarrio: 'Barrio inactivo', comuna: 1, activo: false,
  distanciaPromedioKm: new Prisma.Decimal('2.00'),
};
const restaurantId = randomUUID();
const inactiveRestaurantId = randomUUID();
const productA = {
  id: randomUUID(), restauranteId: restaurantId, nombre: 'Bowl andino', categoriaComida: 'Bowls',
  precio: new Prisma.Decimal('12500.00'), disponible: true,
  empaques: [{ envasesPorUnidad: 1, empaque: { gramosPlasticoEvitados: new Prisma.Decimal('18.50') } }],
};
const productB = {
  id: randomUUID(), restauranteId: restaurantId, nombre: 'Wrap verde', categoriaComida: 'Wraps',
  precio: new Prisma.Decimal('11800.00'), disponible: true,
  empaques: [
    { envasesPorUnidad: 1, empaque: { gramosPlasticoEvitados: new Prisma.Decimal('18.50') } },
    { envasesPorUnidad: 2, empaque: { gramosPlasticoEvitados: new Prisma.Decimal('6.25') } },
  ],
};
const productC = {
  id: randomUUID(), restauranteId: restaurantId, nombre: 'Plato agotado', categoriaComida: 'Varios',
  precio: new Prisma.Decimal('9000.00'), disponible: false,
  empaques: [{ envasesPorUnidad: 1, empaque: { gramosPlasticoEvitados: new Prisma.Decimal('10.00') } }],
};
const productD = {
  id: randomUUID(), restauranteId: randomUUID(), nombre: 'Menú ajeno', categoriaComida: 'Varios',
  precio: new Prisma.Decimal('5000.00'), disponible: true,
  empaques: [{ envasesPorUnidad: 1, empaque: { gramosPlasticoEvitados: new Prisma.Decimal('5.00') } }],
};
const productNoPackaging = {
  id: randomUUID(), restauranteId: restaurantId, nombre: 'Sin empaque', categoriaComida: 'Bebidas',
  precio: new Prisma.Decimal('2500.00'), disponible: true, empaques: [],
};
const restaurant = {
  id: restaurantId, nombre: 'Verde Bistró', categoria: 'Comida saludable', esEco: true, activo: true,
  zonaId: zone.id, email: 'private@example.test', passwordHash: 'must-not-leak',
  zona: { id: zone.id, nombreBarrio: 'Palermo' },
  productos: [productB, productC, productA],
};
const inactiveRestaurant = {
  id: inactiveRestaurantId, nombre: 'Local cerrado', categoria: null, esEco: true, activo: false,
  zonaId: zone.id, zona: { id: zone.id, nombreBarrio: 'Palermo' }, productos: [],
};
const otherRestaurant = {
  id: productD.restauranteId, nombre: 'Otro local', categoria: null, esEco: true, activo: true,
  zonaId: zone.id, zona: { id: zone.id, nombreBarrio: 'Palermo' }, productos: [productD],
};

function fixture() {
  const calls: { method: string; input: any }[] = [];
  let saved: (typeof user & { passwordHash: string }) | null = null;
  const orders: any[] = [];
  const restaurants = [restaurant, inactiveRestaurant, otherRestaurant];
  const zones = [zone, inactiveZone];
  const products = [productA, productB, productC, productD, productNoPackaging];

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

  const db = {
    usuario: {
      async create(input: any) {
        calls.push({ method: 'usuario.create', input });
        if (saved) throw { code: 'P2002' };
        saved = { ...user, ...input.data };
        return saved;
      },
      async findUnique(input: any) {
        calls.push({ method: 'usuario.findUnique', input });
        return saved && (input.where.id === saved.id || input.where.email === saved.email) ? saved : null;
      },
    },
    restaurante: {
      async findMany(input: any) {
        calls.push({ method: 'restaurante.findMany', input });
        return sortRows(restaurants.filter((row) => matches(row, input.where)), input.orderBy);
      },
      async findFirst(input: any) {
        calls.push({ method: 'restaurante.findFirst', input });
        const row = sortRows(
          restaurants.filter((entry) => matches(entry, input.where)), input.orderBy)[0] ?? null;
        if (!row) return null;
        const productsInput = input.select?.productos;
        return {
          ...row,
          productos: productsInput
            ? sortRows(row.productos.filter((p: any) => matches(p, productsInput.where)), productsInput.orderBy)
            : [],
        };
      },
    },
    zona: {
      async findMany(input: any) {
        calls.push({ method: 'zona.findMany', input });
        return sortRows(zones.filter((row) => matches(row, input.where)), input.orderBy);
      },
      async findFirst(input: any) {
        calls.push({ method: 'zona.findFirst', input });
        return zones.find((row) => matches(row, input.where)) ?? null;
      },
    },
    producto: {
      async findMany(input: any) {
        calls.push({ method: 'producto.findMany', input });
        return sortRows(products.filter((row) => matches(row, input.where)), input.orderBy);
      },
    },
    pedido: {
      async findMany(input: any) {
        calls.push({ method: 'pedido.findMany', input });
        return sortRows(orders.filter((row) => matches(row, input.where)), input.orderBy);
      },
      async findFirst(input: any) {
        calls.push({ method: 'pedido.findFirst', input });
        return sortRows(orders.filter((row) => matches(row, input.where)), input.orderBy)[0] ?? null;
      },
      async create(input: any) {
        calls.push({ method: 'pedido.create', input });
        const { detalles, ...data } = input.data;
        const owner = restaurants.find((row) => row.id === data.restauranteId);
        const destination = zones.find((row) => row.id === data.zonaDestinoId);
        const row = {
          id: randomUUID(),
          fechaCreacion: new Date(Date.now() + orders.length),
          ...data,
          detalles: (detalles?.create ?? []).map((detalle: any) => ({ id: randomUUID(), ...detalle })),
          restaurante: owner ? { id: owner.id, nombre: owner.nombre } : null,
          zonaDestino: destination ? { id: destination.id, nombreBarrio: destination.nombreBarrio } : null,
        };
        orders.push(row);
        return row;
      },
    },
    async $executeRaw(...args: any[]) {
      calls.push({ method: 'executeRaw', input: args });
      return 0;
    },
    $transaction(fn: any) { return fn(db); },
  };
  return {
    db: db as unknown as PrismaClient,
    calls,
    deactivate() { if (saved) saved.activo = false; },
  };
}

async function serve(run: (url: string, data: ReturnType<typeof fixture>) => Promise<void>) {
  const data = fixture();
  const server: Server = createApp(data.db, { jwtSecret: secret, corsOrigins: ['http://localhost:5173'], trustProxyHops: 0 })
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

function post(url: string, body: unknown, token?: string) {
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
}

function authed(url: string, token: string) {
  return fetch(url, { headers: { Authorization: `Bearer ${token}` } });
}

async function signIn(url: string) {
  assert.equal((await post(`${url}/users/register`, registration)).status, 201);
  const login = await post(`${url}/users/login`, { email: registration.email, password: registration.password });
  assert.equal(login.status, 200);
  return (await login.json()).accessToken as string;
}

function orderBody(overrides: Record<string, unknown> = {}) {
  return {
    restaurantId,
    destinationZoneId: zone.id,
    deliveryAddress: 'Av. Corrientes 1234',
    transportType: 'BICICLETA',
    items: [
      { productId: productA.id, quantity: 2 },
      { productId: productB.id, quantity: 1 },
    ],
    ...overrides,
  };
}

test('GET /zones returns active zones with numeric distance', async () => {
  await serve(async (url, data) => {
    const response = await fetch(`${url}/zones`);
    assert.equal(response.status, 200);
    const rows = await response.json();
    assert.deepEqual(rows, [{ id: zone.id, name: 'Palermo', comuna: 14, distanceKm: 4.78 }]);
    assert.equal(typeof rows[0].distanceKm, 'number');
    const call = data.calls.find((entry) => entry.method === 'zona.findMany');
    assert.deepEqual(call?.input.where, { activo: true });
  });
});

test('GET /restaurants/:id returns the public menu and rejects invalid ids without DB calls', async () => {
  await serve(async (url, data) => {
    const response = await fetch(`${url}/restaurants/${restaurantId}`);
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.name, 'Verde Bistró');
    assert.equal(body.category, 'Comida saludable');
    assert.equal(body.isEco, true);
    assert.deepEqual(body.zone, { id: zone.id, name: 'Palermo' });
    assert.deepEqual(body.products.map((product: any) => product.name), ['Bowl andino', 'Wrap verde']);
    assert.equal(body.products[0].price, 12500);
    assert.equal(typeof body.products[0].price, 'number');
    assert.equal(body.products[0].available, true);
    const text = JSON.stringify(body);
    assert.equal(text.includes('must-not-leak'), false);
    assert.equal(text.includes('private@example.test'), false);
    const call = data.calls.find((entry) => entry.method === 'restaurante.findFirst');
    assert.deepEqual(call?.input.where, { id: restaurantId, activo: true, esEco: true });
    assert.equal(call?.input.select.passwordHash, undefined);
    assert.equal(call?.input.select.email, undefined);

    const count = data.calls.length;
    for (const id of ['no-es-uuid', '123', restaurantId.slice(0, -1)]) {
      const missing = await fetch(`${url}/restaurants/${id}`);
      assert.equal(missing.status, 404);
      assert.deepEqual(await missing.json(), { error: 'Restaurante no encontrado.' });
    }
    assert.equal(data.calls.length, count);

    const unknown = await fetch(`${url}/restaurants/${randomUUID()}`);
    assert.equal(unknown.status, 404);
    const inactive = await fetch(`${url}/restaurants/${inactiveRestaurantId}`);
    assert.equal(inactive.status, 404);
    assert.deepEqual(await inactive.json(), await unknown.json());
  });
});

test('POST /orders computes totals and impact server-side and stores decimals', async () => {
  await serve(async (url, data) => {
    const token = await signIn(url);
    const response = await post(`${url}/orders`, orderBody({ deliveryAddress: '  Av. Corrientes 1234  ' }), token);
    assert.equal(response.status, 201);
    const { order } = await response.json();
    assert.equal(order.status, 'EN_PREPARACION');
    assert.equal(order.total, 36800);
    assert.equal(order.deliveryAddress, 'Av. Corrientes 1234');
    assert.equal(order.transportType, 'BICICLETA');
    assert.deepEqual(order.restaurant, { id: restaurantId, name: 'Verde Bistró' });
    assert.deepEqual(order.destinationZone, { id: zone.id, name: 'Palermo' });
    assert.equal(order.impact.distanceKm, 4.78);
    assert.equal(order.impact.co2SavedKg, 0.382);
    assert.equal(order.impact.containersAvoided, 5);
    assert.equal(order.impact.plasticAvoidedG, 68);
    assert.equal(order.items.length, 2);
    const [bowl, wrap] = order.items;
    assert.equal(bowl.productId, productA.id);
    assert.equal(bowl.name, 'Bowl andino');
    assert.equal(bowl.quantity, 2);
    assert.equal(bowl.unitPrice, 12500);
    assert.equal(bowl.subtotal, 25000);
    assert.equal(bowl.containersAvoided, 2);
    assert.equal(bowl.plasticAvoidedG, 37);
    assert.equal(wrap.productId, productB.id);
    assert.equal(wrap.subtotal, 11800);
    assert.equal(wrap.containersAvoided, 3);
    assert.equal(wrap.plasticAvoidedG, 31);
    const created = data.calls.find((call) => call.method === 'pedido.create');
    assert.equal(created?.input.data.usuarioId, userId);
    assert.equal(created?.input.data.estado, 'EN_PREPARACION');
    assert.ok(created?.input.data.montoTotal instanceof Prisma.Decimal);
    assert.equal(created?.input.data.montoTotal.equals('36800'), true);
    assert.equal(created?.input.data.co2AhorradoKg.equals('0.382'), true);
    assert.equal(JSON.stringify(order).includes('passwordHash'), false);
  });
});

test('repeating the same order within the window returns it instead of duplicating', async () => {
  await serve(async (url, data) => {
    const token = await signIn(url);
    const first = await post(`${url}/orders`, orderBody(), token);
    assert.equal(first.status, 201);
    const firstBody = await first.json();
    const second = await post(`${url}/orders`, orderBody(), token);
    assert.equal(second.status, 200);
    assert.equal((await second.json()).order.id, firstBody.order.id);
    assert.equal(data.calls.filter((call) => call.method === 'pedido.create').length, 1);

    const different = await post(`${url}/orders`, orderBody({
      items: [{ productId: productA.id, quantity: 3 }, { productId: productB.id, quantity: 1 }],
    }), token);
    assert.equal(different.status, 201);
    assert.notEqual((await different.json()).order.id, firstBody.order.id);
    assert.equal(data.calls.filter((call) => call.method === 'pedido.create').length, 2);
  });
});

test('POST /orders rejects malformed bodies before any DB call', async () => {
  await serve(async (url, data) => {
    const token = await signIn(url);
    const count = data.calls.length;
    const valid = orderBody();
    for (const body of [
      null,
      [],
      { ...valid, userId },
      { ...valid, extra: true },
      { ...valid, restaurantId: 'no-uuid' },
      { ...valid, destinationZoneId: 123 },
      { ...valid, items: [] },
      { ...valid, items: 'no-array' },
      { ...valid, items: Array.from({ length: 51 }, () => ({ productId: productA.id, quantity: 1 })) },
      { ...valid, items: [{ productId: productA.id, quantity: 0 }] },
      { ...valid, items: [{ productId: productA.id, quantity: 1.5 }] },
      { ...valid, items: [{ productId: productA.id, quantity: 100 }] },
      { ...valid, items: [{ productId: productA.id, quantity: '2' }] },
      { ...valid, items: [{ productId: productA.id }] },
      { ...valid, items: [{ productId: productA.id, quantity: 1, nota: 'x' }] },
      { ...valid, items: ['no-object'] },
      { ...valid, items: [{ productId: productA.id, quantity: 1 }, { productId: productA.id, quantity: 2 }] },
      { ...valid, transportType: 'AUTO' },
      { ...valid, transportType: 'bicicleta' },
      { ...valid, deliveryAddress: '' },
      { ...valid, deliveryAddress: '   ' },
      { ...valid, deliveryAddress: 'x'.repeat(201) },
      { ...valid, deliveryAddress: `Calle${String.fromCharCode(0)}falsa` },
    ]) {
      assert.equal((await post(`${url}/orders`, body, token)).status, 400, JSON.stringify(body));
    }
    assert.equal(data.calls.length, count);
  });
});

test('POST /orders rejects unavailable products, foreign or inactive targets and expired sessions', async () => {
  await serve(async (url, data) => {
    const token = await signIn(url);
    const attempt = (items: any[], overrides: Record<string, unknown> = {}) =>
      post(`${url}/orders`, orderBody({ items, ...overrides }), token);
    const single = [{ productId: productA.id, quantity: 1 }];
    assert.equal((await attempt([{ productId: productC.id, quantity: 1 }])).status, 400);
    assert.equal((await attempt([{ productId: productD.id, quantity: 1 }])).status, 400);
    const noPackaging = await attempt([{ productId: productNoPackaging.id, quantity: 1 }]);
    assert.equal(noPackaging.status, 400);
    assert.deepEqual(await noPackaging.json(), { error: 'Uno o más productos no tienen empaque configurado.' });
    assert.equal((await attempt(single, { destinationZoneId: randomUUID() })).status, 400);
    assert.equal((await attempt(single, { destinationZoneId: inactiveZone.id })).status, 400);
    assert.equal((await attempt(single, { restaurantId: randomUUID() })).status, 404);
    assert.equal((await attempt(single, { restaurantId: inactiveRestaurantId })).status, 404);
    assert.equal(data.calls.filter((call) => call.method === 'pedido.create').length, 0);
    assert.ok(data.calls.some((call) => call.method === 'executeRaw'));

    assert.equal((await post(`${url}/orders`, orderBody())).status, 401);
    assert.equal((await fetch(`${url}/orders`)).status, 401);
    assert.equal((await fetch(`${url}/orders/${randomUUID()}`)).status, 401);

    data.deactivate();
    assert.equal((await post(`${url}/orders`, orderBody(), token)).status, 401);
    assert.equal((await authed(`${url}/orders`, token)).status, 401);
    assert.equal((await authed(`${url}/orders/${randomUUID()}`, token)).status, 401);
  });
});

test('GET /orders and /orders/:id only expose the authenticated user\'s orders', async () => {
  await serve(async (url, data) => {
    const token = await signIn(url);
    await post(`${url}/orders`, orderBody(), token);
    const newest = await post(`${url}/orders`, orderBody({
      items: [{ productId: productA.id, quantity: 1 }],
    }), token);
    assert.equal(newest.status, 201);
    const newestId = (await newest.json()).order.id;

    const list = await authed(`${url}/orders`, token);
    assert.equal(list.status, 200);
    const { orders } = await list.json();
    assert.equal(orders.length, 2);
    assert.equal(orders[0].id, newestId);
    const listCall = data.calls.filter((call) => call.method === 'pedido.findMany').at(-1);
    assert.deepEqual(listCall?.input.where, { usuarioId: userId });
    assert.equal(JSON.stringify(orders).includes('passwordHash'), false);

    const own = await authed(`${url}/orders/${newestId}`, token);
    assert.equal(own.status, 200);
    assert.equal((await own.json()).order.id, newestId);

    const count = data.calls.length;
    assert.equal((await authed(`${url}/orders/no-es-uuid`, token)).status, 404);
    assert.equal(data.calls.length, count);
    const missing = await authed(`${url}/orders/${randomUUID()}`, token);
    assert.equal(missing.status, 404);
    assert.deepEqual(await missing.json(), { error: 'Pedido no encontrado.' });
  });
});

test('OpenAPI documents the new contract accurately', async () => {
  await serve(async (url) => {
    const spec = await (await fetch(`${url}/openapi.yaml`)).text();
    assert.match(spec, /version: 1\.1\.0/);
    for (const path of ['/zones:', '/restaurants/{id}:', '/orders:', '/orders/{id}:']) {
      assert.match(spec, new RegExp(`  ${path.replace(/[/.]/g, '\\$&')}$`, 'm'));
    }
    assert.match(spec, /RestaurantRef:/);
    assert.match(spec, /restaurant:\s*\n\s*\$ref: '#\/components\/schemas\/RestaurantRef'/);
    assert.match(spec, /destinationZone:\s*\n\s*\$ref: '#\/components\/schemas\/Zone'/);
    assert.match(spec, /RestaurantDetail:\s*\n\s*type: object/);
    assert.doesNotMatch(spec, /RestaurantDetail:\s*\n\s*allOf/);
  });
});

test('unsupported methods on the new routes return 404', async () => {
  await serve(async (url) => {
    assert.equal((await fetch(`${url}/orders`, { method: 'DELETE' })).status, 404);
    assert.equal((await fetch(`${url}/orders/${randomUUID()}`, { method: 'PATCH' })).status, 404);
    assert.equal((await fetch(`${url}/restaurants/${restaurantId}`, { method: 'PUT' })).status, 404);
    assert.equal((await fetch(`${url}/zones`, { method: 'DELETE' })).status, 404);
  });
});
