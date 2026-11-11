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
const orphanAdminId = randomUUID();
const inactiveOwnerId = randomUUID();
const clientId = randomUUID();
const platformAdminId = randomUUID();
const restaurantId = randomUUID();
const otherRestaurantId = randomUUID();
const inactiveRestaurantId = randomUUID();
const zone = { id: randomUUID(), nombreBarrio: 'Palermo' };

// Same names/materials as prisma/seed.ts so the contract is exercised against
// the real catalog; one row keeps usoHabitual null to cover the nullable column.
const EMPAQUES = [
  { nombreEnvase: 'Caja para Hamburguesa / Sándwich', materialTradicional: 'Poliestireno expandido (Telgopor)', materialEcobite: 'Fibra de Caña de Azúcar / Cartón Kraft', gramos: '25', usoHabitual: 'Hamburguesas; lomitos; choripán; sándwiches de milanesa' },
  { nombreEnvase: 'Contenedor / Vianda Rectangular', materialTradicional: 'Plástico Polipropileno (PP) / Telgopor', materialEcobite: 'Bagazo de Caña / Fécula de Maíz', gramos: '35', usoHabitual: 'Milanesa con papas; pastel de papas; ñoquis, ravioles y tallarines' },
  { nombreEnvase: 'Bowl Circular (750ml / 1000ml)', materialTradicional: 'Plástico PET rígido transparente', materialEcobite: 'Cartón Kraft laminado en PLA / Caña', gramos: '40', usoHabitual: 'Ensaladas; guisos y locro; fideos con salsa' },
  { nombreEnvase: 'Pote para Salsa / Dip (60-120 ml)', materialTradicional: 'Poliestireno (PS) inyectado', materialEcobite: 'Papel compostable / Bioplástico PLA', gramos: '8', usoHabitual: 'Aderezos; salsas' },
  { nombreEnvase: 'Envase para Postre / Helado', materialTradicional: 'Pote de Telgopor / Plástico Copolímero', materialEcobite: 'Cartón polipapel / Bioplástico PLA', gramos: '20', usoHabitual: 'Helado artesanal; postres' },
  { nombreEnvase: 'Caja para Pizza / Empanadas', materialTradicional: 'Cartón con faja / lámina plástica', materialEcobite: 'Cartón corrugado 100% reciclado', gramos: '15', usoHabitual: 'Pizzas; empanadas' },
  { nombreEnvase: 'Kit Cubiertos + Bolsa', materialTradicional: 'Plástico de un solo uso (Camiseta)', materialEcobite: 'Madera de bambú + Bolsa Kraft', gramos: '12', usoHabitual: null },
  { nombreEnvase: 'Vaso / Botella para bebida', materialTradicional: 'Plástico PET / Poliestireno (Desechable)', materialEcobite: 'Cartón polipapel / Bioplástico PLA compostable', gramos: '22', usoHabitual: 'Licuados; jugos; gaseosas de la casa' },
].map((row) => ({ id: randomUUID(), ...row }));

const envase = (name: string) => EMPAQUES.find((row) => row.nombreEnvase === name)!;

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
    [orphanAdminId, {
      id: orphanAdminId, nombreCompleto: 'Admin sin local', email: 'sin.local@example.test',
      rol: 'RESTAURANTE_ADMIN', activo: true, passwordHash: 'hash-must-not-leak', restauranteId: null,
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
  ]);
  const empaques = EMPAQUES.map((row) => ({
    ...row,
    gramosPlasticoEvitados: new Prisma.Decimal(row.gramos),
  }));
  const restaurantes = [
    {
      id: restaurantId, nombre: 'Verde Bistró', categoria: 'COMIDA_SALUDABLE',
      esEco: true, activo: true, zonaId: zone.id, email: 'local@example.test',
    },
    {
      id: otherRestaurantId, nombre: 'Otro local', categoria: 'COMIDA_VEGANA',
      esEco: true, activo: true, zonaId: zone.id, email: 'otro@example.test',
    },
    {
      id: inactiveRestaurantId, nombre: 'Local pendiente', categoria: 'COMIDA_CASERA',
      esEco: true, activo: false, zonaId: zone.id, email: 'pendiente@example.test',
    },
  ];
  const productos: any[] = [
    {
      id: randomUUID(), restauranteId: otherRestaurantId, nombre: 'Menú ajeno',
      categoriaComida: 'Varios', precio: new Prisma.Decimal('5000.00'), disponible: true,
      fechaCreacion: new Date('2026-01-01T00:00:00Z'),
      empaques: [{ empaqueId: empaques[0].id, envasesPorUnidad: 1 }],
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

  // Mirrors the nested select in products.service: the join rows resolve their
  // empaque and come back ordered by empaqueId.
  function withProductRelations(row: any) {
    const joins = (row.empaques ?? []).map((join: any) => ({
      ...join,
      empaque: empaques.find((envaseRow) => envaseRow.id === join.empaqueId) ?? null,
    }));
    return { ...row, empaques: sortRows(joins, [{ empaqueId: 'asc' }]) };
  }

  const db = {
    usuario: {
      async findUnique(input: any) {
        calls.push({ method: 'usuario.findUnique', input });
        const row = [...users.values()].find((user) =>
          (input.where.id && user.id === input.where.id) ||
          (input.where.email && user.email === input.where.email)) ?? null;
        if (!row) return null;
        const local = restaurantes.find((item) => item.id === row.restauranteId) ?? null;
        return { ...row, restaurante: local ? { id: local.id, activo: local.activo } : null };
      },
    },
    restaurante: {
      async findFirst(input: any) {
        calls.push({ method: 'restaurante.findFirst', input });
        const row = sortRows(
          restaurantes.filter((item) => matches(item, input.where)), input.orderBy)[0] ?? null;
        if (!row) return null;
        const productsInput = input.select?.productos;
        return {
          ...row,
          zona: { id: zone.id, nombreBarrio: zone.nombreBarrio },
          productos: productsInput
            ? sortRows(
              productos.filter(
                (item) => item.restauranteId === row.id && matches(item, productsInput.where)),
              productsInput.orderBy)
            : [],
        };
      },
    },
    empaque: {
      async findMany(input: any) {
        calls.push({ method: 'empaque.findMany', input });
        return sortRows(empaques.filter((row) => matches(row, input?.where)), input?.orderBy);
      },
    },
    producto: {
      async findMany(input: any) {
        calls.push({ method: 'producto.findMany', input });
        return sortRows(productos.filter((row) => matches(row, input.where)), input.orderBy)
          .map(withProductRelations);
      },
      async create(input: any) {
        calls.push({ method: 'producto.create', input });
        const { empaques: nested, ...data } = input.data;
        const row = {
          id: randomUUID(),
          fechaCreacion: new Date(Date.now() + productos.length),
          ...data,
          precio: new Prisma.Decimal(data.precio),
          empaques: [...(nested?.create ?? [])],
        };
        productos.push(row);
        return withProductRelations(row);
      },
    },
  };
  return {
    db: db as unknown as PrismaClient, calls, users, productos, empaques,
  };
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

function get(url: string, token?: string) {
  return fetch(url, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined);
}

const ownerToken = () => createToken(ownerId, secret);

function productBody(overrides: Record<string, unknown> = {}) {
  return {
    name: 'Bowl andino',
    foodCategory: 'Bowls',
    price: 12500.50,
    packagings: [
      { packagingId: envase('Contenedor / Vianda Rectangular').id, unitsPerPackage: 2 },
      { packagingId: envase('Kit Cubiertos + Bolsa').id, unitsPerPackage: 1 },
    ],
    ...overrides,
  };
}

test('GET /packagings is public and returns the eight packagings sorted by name', async () => {
  await serve(async (url, data) => {
    const response = await get(`${url}/packagings`);
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.packagings.length, 8);
    assert.deepEqual(
      body.packagings.map((row: any) => row.name),
      EMPAQUES.map((row) => row.nombreEnvase).sort(),
    );
    const first = body.packagings[0];
    assert.deepEqual(Object.keys(first).sort(), [
      'ecoMaterial', 'gramsPlasticAvoided', 'id', 'name', 'traditionalMaterial', 'usualUse',
    ]);
    const vianda = body.packagings.find(
      (row: any) => row.name === 'Contenedor / Vianda Rectangular');
    assert.equal(vianda.gramsPlasticAvoided, 35);
    assert.equal(typeof vianda.gramsPlasticAvoided, 'number');
    assert.equal(vianda.traditionalMaterial, 'Plástico Polipropileno (PP) / Telgopor');
    assert.equal(vianda.ecoMaterial, 'Bagazo de Caña / Fécula de Maíz');
    const kit = body.packagings.find((row: any) => row.name === 'Kit Cubiertos + Bolsa');
    assert.equal(kit.usualUse, null);
    const call = data.calls.find((entry) => entry.method === 'empaque.findMany');
    assert.equal(call?.input.where, undefined);
    assert.equal(JSON.stringify(body).includes('hash-must-not-leak'), false);
  });
});

test('POST /restaurants/me/products requires auth, RESTAURANTE_ADMIN and an operable restaurant', async () => {
  await serve(async (url, data) => {
    assert.equal((await post(`${url}/restaurants/me/products`, productBody())).status, 401);
    for (const userId of [clientId, platformAdminId]) {
      const response = await post(
        `${url}/restaurants/me/products`, productBody(), createToken(userId, secret));
      assert.equal(response.status, 403, userId);
      assert.deepEqual(await response.json(), {
        error: 'No tenés permisos para acceder a este recurso.',
      });
    }
    for (const userId of [orphanAdminId, inactiveOwnerId]) {
      const response = await post(
        `${url}/restaurants/me/products`, productBody(), createToken(userId, secret));
      assert.equal(response.status, 403, userId);
      assert.deepEqual(await response.json(), {
        error: 'El restaurante no está habilitado para operar.',
      });
    }
    assert.equal(data.calls.filter((call) => call.method === 'producto.create').length, 0);
  });
});

test('POST /restaurants/me/products creates the dish with its packagings and publishes it', async () => {
  await serve(async (url, data) => {
    const response = await post(
      `${url}/restaurants/me/products`, productBody({ name: '  Bowl andino  ' }), ownerToken());
    assert.equal(response.status, 201);
    const { product } = await response.json();
    assert.equal(product.name, 'Bowl andino');
    assert.equal(product.category, 'Bowls');
    assert.equal(product.price, 12500.5);
    assert.equal(typeof product.price, 'number');
    assert.equal(product.available, true);
    const sortedIds = [
      envase('Contenedor / Vianda Rectangular').id,
      envase('Kit Cubiertos + Bolsa').id,
    ].sort();
    assert.deepEqual(product.packagings, sortedIds.map((id) => ({
      id,
      name: EMPAQUES.find((row) => row.id === id)!.nombreEnvase,
      unitsPerPackage: id === envase('Contenedor / Vianda Rectangular').id ? 2 : 1,
    })));

    const create = data.calls.find((call) => call.method === 'producto.create');
    assert.equal(create?.input.data.restauranteId, restaurantId);
    assert.equal(create?.input.data.nombre, 'Bowl andino');
    assert.equal(create?.input.data.categoriaComida, 'Bowls');
    assert.equal(create?.input.data.precio, 12500.50);
    assert.equal(create?.input.data.disponible, true);
    assert.deepEqual(create?.input.data.empaques.create, [
      { empaqueId: envase('Contenedor / Vianda Rectangular').id, envasesPorUnidad: 2 },
      { empaqueId: envase('Kit Cubiertos + Bolsa').id, envasesPorUnidad: 1 },
    ]);

    // The owner list shows it and the public menu exposes it right away:
    // /restaurants/:id keeps resolving next to the me/products routes.
    const mine = await (await get(`${url}/restaurants/me/products`, ownerToken())).json();
    assert.deepEqual(mine.products.map((row: any) => row.id), [product.id]);
    const detail = await (await get(`${url}/restaurants/${restaurantId}`)).json();
    assert.equal(detail.name, 'Verde Bistró');
    assert.deepEqual(detail.products, [{
      id: product.id,
      name: 'Bowl andino',
      category: 'Bowls',
      price: 12500.5,
      available: true,
    }]);
    const text = JSON.stringify({ product, mine, detail });
    assert.equal(text.includes('hash-must-not-leak'), false);
    assert.equal(text.includes('passwordHash'), false);
  });
});

test('a dish created unavailable is listed for the owner but hidden from the public menu', async () => {
  await serve(async (url) => {
    const created = await post(
      `${url}/restaurants/me/products`,
      productBody({ name: 'Bowl secreto', available: false }),
      ownerToken());
    assert.equal(created.status, 201);
    const { product } = await created.json();
    assert.equal(product.available, false);
    const mine = await (await get(`${url}/restaurants/me/products`, ownerToken())).json();
    assert.deepEqual(mine.products.map((row: any) => row.id), [product.id]);
    const detail = await (await get(`${url}/restaurants/${restaurantId}`)).json();
    assert.deepEqual(detail.products, []);
  });
});

test('POST /restaurants/me/products rejects invalid bodies without touching the catalog or dishes', async () => {
  await serve(async (url, data) => {
    const token = ownerToken();
    for (const body of [
      null,
      [],
      productBody({ extra: true }),
      productBody({ restauranteId: restaurantId }),
      productBody({ name: '' }),
      productBody({ name: '   ' }),
      productBody({ name: 'x'.repeat(121) }),
      productBody({ name: undefined }),
      productBody({ foodCategory: '' }),
      productBody({ foodCategory: 'x'.repeat(101) }),
      productBody({ price: 0 }),
      productBody({ price: -5 }),
      productBody({ price: '12.50' }),
      productBody({ price: 12.999 }),
      productBody({ price: 99999999.991 }),
      productBody({ price: 100000000 }),
      productBody({ available: 'yes' }),
      productBody({ packagings: [] }),
      productBody({ packagings: 'no-array' }),
      productBody({ packagings: [{ packagingId: envase('Bowl Circular (750ml / 1000ml)').id }] }),
      productBody({ packagings: [{ packagingId: 'no-es-uuid', unitsPerPackage: 1 }] }),
      productBody({ packagings: [{ packagingId: envase('Bowl Circular (750ml / 1000ml)').id, unitsPerPackage: 0 }] }),
      productBody({ packagings: [{ packagingId: envase('Bowl Circular (750ml / 1000ml)').id, unitsPerPackage: 1.5 }] }),
      productBody({ packagings: [{ packagingId: envase('Bowl Circular (750ml / 1000ml)').id, unitsPerPackage: '2' }] }),
      productBody({ packagings: [{ packagingId: envase('Bowl Circular (750ml / 1000ml)').id, unitsPerPackage: 1, nota: 'x' }] }),
      productBody({ packagings: [
        { packagingId: envase('Bowl Circular (750ml / 1000ml)').id, unitsPerPackage: 1 },
        { packagingId: envase('Bowl Circular (750ml / 1000ml)').id, unitsPerPackage: 2 },
      ] }),
    ]) {
      const response = await post(`${url}/restaurants/me/products`, body, token);
      assert.equal(response.status, 400, JSON.stringify(body));
    }

    const decimals = await post(
      `${url}/restaurants/me/products`, productBody({ price: 12.999 }), token);
    assert.deepEqual(await decimals.json(), {
      error: 'El precio debe tener como máximo 2 decimales.',
    });
    const units = await post(
      `${url}/restaurants/me/products`,
      productBody({ packagings: [{ packagingId: envase('Bowl Circular (750ml / 1000ml)').id, unitsPerPackage: 0 }] }),
      token);
    assert.deepEqual(await units.json(), {
      error: 'unitsPerPackage debe ser un entero de al menos 1.',
    });
    const duplicated = await post(
      `${url}/restaurants/me/products`,
      productBody({ packagings: [
        { packagingId: envase('Bowl Circular (750ml / 1000ml)').id, unitsPerPackage: 1 },
        { packagingId: envase('Bowl Circular (750ml / 1000ml)').id, unitsPerPackage: 2 },
      ] }),
      token);
    assert.deepEqual(await duplicated.json(), {
      error: 'Envase duplicado: cada packagingId puede aparecer una sola vez.',
    });
    const extra = await post(
      `${url}/restaurants/me/products`, productBody({ extra: true }), token);
    assert.deepEqual(await extra.json(), {
      error: 'Solo se permiten los campos name, foodCategory, price, available y packagings.',
    });

    assert.equal(
      data.calls.filter(
        (call) => call.method === 'producto.create' || call.method === 'empaque.findMany').length,
      0,
    );
  });
});

test('POST /restaurants/me/products returns 400 when a packaging id does not exist', async () => {
  await serve(async (url) => {
    const missing = await post(
      `${url}/restaurants/me/products`,
      productBody({ packagings: [{ packagingId: randomUUID(), unitsPerPackage: 1 }] }),
      ownerToken());
    assert.equal(missing.status, 400);
    assert.deepEqual(await missing.json(), { error: 'Uno o más envases no existen.' });
    const mixed = await post(
      `${url}/restaurants/me/products`,
      productBody({ packagings: [
        { packagingId: envase('Bowl Circular (750ml / 1000ml)').id, unitsPerPackage: 1 },
        { packagingId: randomUUID(), unitsPerPackage: 1 },
      ] }),
      ownerToken());
    assert.equal(mixed.status, 400);
    assert.deepEqual(await mixed.json(), { error: 'Uno o más envases no existen.' });
  });
});

test('GET /restaurants/me/products returns only the own dishes, newest first', async () => {
  await serve(async (url) => {
    assert.equal((await get(`${url}/restaurants/me/products`)).status, 401);
    assert.equal(
      (await get(`${url}/restaurants/me/products`, createToken(clientId, secret))).status, 403);
    assert.equal(
      (await get(`${url}/restaurants/me/products`, createToken(orphanAdminId, secret))).status, 403);
    assert.equal(
      (await get(`${url}/restaurants/me/products`, createToken(inactiveOwnerId, secret))).status, 403);

    const first = await (await post(
      `${url}/restaurants/me/products`, productBody({ name: 'Primero' }), ownerToken())).json();
    const second = await (await post(
      `${url}/restaurants/me/products`, productBody({ name: 'Segundo' }), ownerToken())).json();
    const mine = await (await get(`${url}/restaurants/me/products`, ownerToken())).json();
    assert.deepEqual(
      mine.products.map((row: any) => row.id), [second.product.id, first.product.id]);
    assert.equal(mine.products[0].packagings.length, 2);

    const other = await (await get(
      `${url}/restaurants/me/products`, createToken(otherOwnerId, secret))).json();
    assert.deepEqual(other.products.map((row: any) => row.name), ['Menú ajeno']);
    assert.deepEqual(other.products[0].packagings, [{
      id: envase('Caja para Hamburguesa / Sándwich').id,
      name: 'Caja para Hamburguesa / Sándwich',
      unitsPerPackage: 1,
    }]);
    assert.equal(JSON.stringify({ mine, other }).includes('hash-must-not-leak'), false);
    assert.equal(JSON.stringify({ mine, other }).includes('passwordHash'), false);
  });
});
