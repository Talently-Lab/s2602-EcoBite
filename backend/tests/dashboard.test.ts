import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { once } from 'node:events';
import type { Server } from 'node:http';
import { test } from 'node:test';
import jwt from 'jsonwebtoken';
import { createApp } from '../src/app';
import { Prisma } from '../src/generated/prisma/client';
import type { PrismaClient } from '../src/generated/prisma/client';
import { createToken } from '../src/lib/tokens';

const secret = randomBytes(32).toString('hex');
const adminId = randomUUID();
const clienteId = randomUUID();

function fixture() {
  const calls: { method: string; input: any }[] = [];
  const users = new Map<string, { rol: string; activo: boolean }>([
    [adminId, { rol: 'ADMIN_PLATAFORMA', activo: true }],
    [clienteId, { rol: 'CLIENTE', activo: true }],
  ]);
  let aggregateResult: any = {
    _count: { _all: 2 },
    _sum: {
      montoTotal: new Prisma.Decimal('4000.25'),
      co2AhorradoKg: new Prisma.Decimal('1.582'),
    },
  };
  let failure: unknown;
  let aggregateFailure: unknown;
  const db = {
    usuario: {
      async findUnique(input: any) {
        calls.push({ method: 'usuario.findUnique', input });
        if (failure) throw failure;
        const record = users.get(input.where.id);
        return record ? { activo: record.activo, rol: record.rol } : null;
      },
    },
    pedido: {
      async aggregate(input: any) {
        calls.push({ method: 'pedido.aggregate', input });
        if (aggregateFailure) throw aggregateFailure;
        return aggregateResult;
      },
    },
  };
  return {
    db: db as unknown as PrismaClient,
    calls,
    users,
    setAggregate(result: any) { aggregateResult = result; },
    fail(error: unknown) { failure = error; },
    failAggregate(error: unknown) { aggregateFailure = error; },
    aggregateCalls() { return calls.filter((call) => call.method === 'pedido.aggregate'); },
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

function authed(url: string, token: string) {
  return fetch(`${url}/dashboard/stats`, { headers: { Authorization: `Bearer ${token}` } });
}

test('GET /dashboard/stats returns global aggregates for completed orders only', async () => {
  await serve(async (url, data) => {
    const response = await authed(url, createToken(adminId, secret));
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.deepEqual(body, { totalOrders: 2, totalRevenue: 4000.25, totalCo2Saved: 1.582 });
    assert.equal(typeof body.totalOrders, 'number');
    assert.equal(typeof body.totalRevenue, 'number');
    assert.equal(typeof body.totalCo2Saved, 'number');
    const call = data.aggregateCalls()[0];
    assert.deepEqual(call.input.where, { estado: 'COMPLETADO' });
    assert.deepEqual(call.input._count, { _all: true });
    assert.deepEqual(call.input._sum, { montoTotal: true, co2AhorradoKg: true });
  });
});

test('GET /dashboard/stats returns zeroed totals when nothing is completed', async () => {
  await serve(async (url, data) => {
    data.setAggregate({ _count: { _all: 0 }, _sum: { montoTotal: null, co2AhorradoKg: null } });
    const response = await authed(url, createToken(adminId, secret));
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { totalOrders: 0, totalRevenue: 0, totalCo2Saved: 0 });
  });
});

test('GET /dashboard/stats re-checks the role in the database on every request', async () => {
  await serve(async (url, data) => {
    const adminToken = createToken(adminId, secret);
    const clienteToken = createToken(clienteId, secret);

    const missing = await fetch(`${url}/dashboard/stats`);
    assert.equal(missing.status, 401);
    assert.deepEqual(await missing.json(), { error: 'Se requiere un token Bearer.' });
    assert.equal((await fetch(`${url}/dashboard/stats`, {
      headers: { Authorization: 'Bearer no-es-un-jwt' },
    })).status, 401);

    const cliente = await authed(url, clienteToken);
    assert.equal(cliente.status, 403);
    assert.deepEqual(await cliente.json(), { error: 'No tenés permisos para acceder a este recurso.' });

    data.users.set(adminId, { rol: 'RESTAURANTE_ADMIN', activo: true });
    assert.equal((await authed(url, adminToken)).status, 403);

    data.users.set(adminId, { rol: 'ADMIN_PLATAFORMA', activo: false });
    assert.equal((await authed(url, adminToken)).status, 401);

    assert.equal((await authed(url, createToken(randomUUID(), secret))).status, 401);

    // Un claim de rol en el JWT no otorga acceso: el rol se lee de la base.
    const forged = jwt.sign({ role: 'ADMIN_PLATAFORMA' }, secret, {
      algorithm: 'HS256', subject: clienteId,
      issuer: 'ecobite-api', audience: 'ecobite-customer', expiresIn: 3600,
    });
    assert.equal((await authed(url, forged)).status, 403);

    // El mismo token válido pierde acceso apenas se degrada el rol en la base.
    data.users.set(adminId, { rol: 'CLIENTE', activo: true });
    assert.equal((await authed(url, adminToken)).status, 403);
    assert.equal(data.aggregateCalls().length, 0);

    data.users.set(adminId, { rol: 'ADMIN_PLATAFORMA', activo: true });
    assert.equal((await authed(url, adminToken)).status, 200);
    assert.equal(data.aggregateCalls().length, 1);
  });
});

test('GET /dashboard/stats returns 503 when the database is unavailable', async () => {
  await serve(async (url, data) => {
    data.failAggregate({ code: 'P1001' });
    const response = await authed(url, createToken(adminId, secret));
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { error: 'Servicio temporalmente no disponible.' });
  });
});
