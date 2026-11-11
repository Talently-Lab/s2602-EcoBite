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
const userId = randomUUID();
const otherUserId = randomUUID();
const adminId = randomUUID();

function fixture() {
  const calls: { method: string; input: any }[] = [];
  const users = new Map<string, { rol: string; activo: boolean }>([
    [userId, { rol: 'CLIENTE', activo: true }],
    [otherUserId, { rol: 'CLIENTE', activo: true }],
    [adminId, { rol: 'ADMIN_PLATAFORMA', activo: true }],
  ]);
  const orders: any[] = [];
  const db = {
    usuario: {
      async findUnique(input: any) {
        calls.push({ method: 'usuario.findUnique', input });
        const record = users.get(input.where.id);
        return record ? { activo: record.activo, rol: record.rol } : null;
      },
    },
    pedido: {
      async aggregate(input: any) {
        calls.push({ method: 'pedido.aggregate', input });
        const rows = orders.filter((row) => {
          if (input.where?.usuarioId !== undefined && row.usuarioId !== input.where.usuarioId) return false;
          if (input.where?.estado !== undefined && row.estado !== input.where.estado) return false;
          return true;
        });
        return {
          _count: { _all: input._count?._all ? rows.length : 0 },
          _sum: {
            // Real Prisma returns null sums when no row matches.
            co2AhorradoKg: !input._sum?.co2AhorradoKg || rows.length === 0 ? null
              : rows.reduce((sum, row) => sum.plus(row.co2AhorradoKg), new Prisma.Decimal(0)),
            totalEnvasesEvitados: !input._sum?.totalEnvasesEvitados || rows.length === 0 ? null
              : rows.reduce((sum, row) => sum + row.totalEnvasesEvitados, 0),
          },
        };
      },
    },
  };
  return {
    db: db as unknown as PrismaClient,
    calls,
    users,
    orders,
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
  return fetch(`${url}/users/me/impact`, { headers: { Authorization: `Bearer ${token}` } });
}

function order(usuarioId: string, estado: string, co2: string, envases: number) {
  return {
    usuarioId, estado,
    co2AhorradoKg: new Prisma.Decimal(co2),
    totalEnvasesEvitados: envases,
  };
}

test('GET /users/me/impact sums only the caller\'s COMPLETADO orders as plain numbers', async () => {
  await serve(async (url, data) => {
    data.orders.push(
      order(userId, 'COMPLETADO', '1.250', 3),
      order(userId, 'COMPLETADO', '0.382', 2),
      order(userId, 'PENDIENTE', '9.999', 40),
      order(userId, 'EN_PREPARACION', '9.999', 40),
      order(userId, 'CANCELADO', '9.999', 40),
      order(otherUserId, 'COMPLETADO', '9.999', 50),
    );
    const response = await authed(url, createToken(userId, secret));
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.deepEqual(body, {
      impact: { totalCo2SavedKg: 1.632, totalContainersAvoided: 5, totalOrders: 2 },
    });
    assert.equal(typeof body.impact.totalCo2SavedKg, 'number');
    assert.equal(typeof body.impact.totalContainersAvoided, 'number');
    assert.equal(typeof body.impact.totalOrders, 'number');
    const call = data.aggregateCalls()[0];
    assert.deepEqual(call.input.where, { usuarioId: userId, estado: 'COMPLETADO' });
    assert.deepEqual(call.input._count, { _all: true });
    assert.deepEqual(call.input._sum, { co2AhorradoKg: true, totalEnvasesEvitados: true });
  });
});

test('GET /users/me/impact returns zeros when the caller has no completed orders', async () => {
  await serve(async (url, data) => {
    // Another user's completed orders never leak into the response.
    data.orders.push(order(otherUserId, 'COMPLETADO', '9.999', 50));
    const response = await authed(url, createToken(userId, secret));
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      impact: { totalCo2SavedKg: 0, totalContainersAvoided: 0, totalOrders: 0 },
    });
    assert.equal(data.aggregateCalls()[0].input.where.usuarioId, userId);
  });
});

test('GET /users/me/impact requires a valid token and an active account', async () => {
  await serve(async (url, data) => {
    const missing = await fetch(`${url}/users/me/impact`);
    assert.equal(missing.status, 401);
    assert.deepEqual(await missing.json(), { error: 'Se requiere un token Bearer.' });
    assert.equal((await fetch(`${url}/users/me/impact`, {
      headers: { Authorization: 'Bearer no-es-un-jwt' },
    })).status, 401);
    // The aggregate never runs without an active account: nothing can leak.
    assert.equal((await authed(url, createToken(randomUUID(), secret))).status, 401);
    data.users.set(userId, { rol: 'CLIENTE', activo: false });
    const inactive = await authed(url, createToken(userId, secret));
    assert.equal(inactive.status, 401);
    assert.deepEqual(await inactive.json(), { error: 'Sesión inválida o vencida.' });
    assert.equal(data.aggregateCalls().length, 0);
  });
});

test('GET /users/me/impact accepts any active role, not only CLIENTE', async () => {
  await serve(async (url, data) => {
    data.orders.push(order(adminId, 'COMPLETADO', '2.500', 4));
    const response = await authed(url, createToken(adminId, secret));
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      impact: { totalCo2SavedKg: 2.5, totalContainersAvoided: 4, totalOrders: 1 },
    });
  });
});
