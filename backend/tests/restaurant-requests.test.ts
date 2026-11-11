import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { once } from 'node:events';
import type { Server } from 'node:http';
import { test } from 'node:test';
import { createApp } from '../src/app';
import type { PrismaClient } from '../src/generated/prisma/client';
import { createToken } from '../src/lib/tokens';

const secret = randomBytes(32).toString('hex');
const applicantId = randomUUID();
const applicant2Id = randomUUID();
const adminId = randomUUID();
const restaurantAdminId = randomUUID();
const inactiveId = randomUUID();

const zone = { id: randomUUID(), nombreBarrio: 'Palermo', activo: true };
const inactiveZone = { id: randomUUID(), nombreBarrio: 'Barrio inactivo', activo: false };

function fixture() {
  const calls: { method: string; input: any }[] = [];
  const users = new Map<string, any>([
    [applicantId, {
      id: applicantId, nombreCompleto: 'Cliente Solicitante', email: 'cliente@example.test',
      rol: 'CLIENTE', activo: true, passwordHash: 'hash-must-not-leak', restauranteId: null,
    }],
    [applicant2Id, {
      id: applicant2Id, nombreCompleto: 'Otro Cliente', email: 'otro@example.test',
      rol: 'CLIENTE', activo: true, passwordHash: 'hash-must-not-leak', restauranteId: null,
    }],
    [adminId, {
      id: adminId, nombreCompleto: 'Admin Plataforma', email: 'admin@example.test',
      rol: 'ADMIN_PLATAFORMA', activo: true, passwordHash: 'hash-must-not-leak', restauranteId: null,
    }],
    [restaurantAdminId, {
      id: restaurantAdminId, nombreCompleto: 'Admin Restaurante', email: 'local@example.test',
      rol: 'RESTAURANTE_ADMIN', activo: true, passwordHash: 'hash-must-not-leak', restauranteId: null,
    }],
    [inactiveId, {
      id: inactiveId, nombreCompleto: 'Cuenta inactiva', email: 'inactivo@example.test',
      rol: 'CLIENTE', activo: false, passwordHash: 'hash-must-not-leak', restauranteId: null,
    }],
  ]);
  const zones = [zone, inactiveZone];
  const restaurantes: any[] = [];
  const solicitudes: any[] = [];

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

  function withRelations(row: any) {
    const owner = users.get(row.usuarioId);
    const reviewer = row.adminRevisorId ? users.get(row.adminRevisorId) : null;
    const destination = zones.find((entry) => entry.id === row.zonaId);
    return {
      ...row,
      usuario: owner ? { ...owner } : null,
      adminRevisor: reviewer ? { ...reviewer } : null,
      zona: destination ? { id: destination.id, nombreBarrio: destination.nombreBarrio } : null,
    };
  }

  const db = {
    usuario: {
      async findUnique(input: any) {
        calls.push({ method: 'usuario.findUnique', input });
        return [...users.values()].find((row) =>
          (input.where.id && row.id === input.where.id) ||
          (input.where.email && row.email === input.where.email)) ?? null;
      },
      async update(input: any) {
        calls.push({ method: 'usuario.update', input });
        const row = users.get(input.where.id);
        if (!row) throw { code: 'P2025' };
        Object.assign(row, input.data);
        return row;
      },
    },
    zona: {
      async findFirst(input: any) {
        calls.push({ method: 'zona.findFirst', input });
        return zones.find((row) => matches(row, input.where)) ?? null;
      },
    },
    restaurante: {
      async findFirst(input: any) {
        calls.push({ method: 'restaurante.findFirst', input });
        return restaurantes.find((row) => matches(row, input.where)) ?? null;
      },
      async create(input: any) {
        calls.push({ method: 'restaurante.create', input });
        if (restaurantes.some((row) => row.email === input.data.email)) throw { code: 'P2002' };
        const row = { id: randomUUID(), fechaCreacion: new Date(), ...input.data };
        restaurantes.push(row);
        return row;
      },
    },
    solicitudRestaurante: {
      async findFirst(input: any) {
        calls.push({ method: 'solicitudRestaurante.findFirst', input });
        const row = sortRows(
          solicitudes.filter((entry) => matches(entry, input.where)), input.orderBy)[0] ?? null;
        return row ? withRelations(row) : null;
      },
      async findUnique(input: any) {
        calls.push({ method: 'solicitudRestaurante.findUnique', input });
        const row = solicitudes.find((entry) => entry.id === input.where.id) ?? null;
        return row ? withRelations(row) : null;
      },
      async findMany(input: any) {
        calls.push({ method: 'solicitudRestaurante.findMany', input });
        return sortRows(
          solicitudes.filter((entry) => matches(entry, input.where)), input.orderBy)
          .map(withRelations);
      },
      async create(input: any) {
        calls.push({ method: 'solicitudRestaurante.create', input });
        if (solicitudes.some((row) => row.email === input.data.email)) throw { code: 'P2002' };
        const row = {
          id: randomUUID(),
          fechaSolicitud: new Date(Date.now() + solicitudes.length),
          fechaRevision: null,
          adminRevisorId: null,
          ...input.data,
        };
        solicitudes.push(row);
        return withRelations(row);
      },
      async updateMany(input: any) {
        calls.push({ method: 'solicitudRestaurante.updateMany', input });
        let count = 0;
        for (const row of solicitudes) {
          if (matches(row, input.where)) {
            Object.assign(row, input.data);
            count += 1;
          }
        }
        return { count };
      },
    },
    async $executeRaw(...args: any[]) {
      calls.push({ method: 'executeRaw', input: args });
      return 0;
    },
    async $transaction(fn: any) {
      const snapshot = {
        solicitudes: solicitudes.map((row) => ({ ...row })),
        restaurantes: restaurantes.map((row) => ({ ...row })),
        users: new Map([...users].map(([id, row]) => [id, { ...row }])),
      };
      try {
        return await fn(db);
      } catch (error) {
        solicitudes.splice(0, solicitudes.length, ...snapshot.solicitudes);
        restaurantes.splice(0, restaurantes.length, ...snapshot.restaurantes);
        users.clear();
        for (const [id, row] of snapshot.users) users.set(id, row);
        throw error;
      }
    },
  };
  return { db: db as unknown as PrismaClient, calls, users, restaurantes, solicitudes };
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

function get(url: string, token?: string) {
  return fetch(url, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined);
}

function requestBody(overrides: Record<string, unknown> = {}) {
  return {
    name: 'Verde Bistró',
    category: 'COMIDA_SALUDABLE',
    zoneId: zone.id,
    address: 'Av. Santa Fe 1234',
    email: 'contacto@verdebistro.test',
    commitmentAccepted: true,
    ...overrides,
  };
}

const applicantToken = () => createToken(applicantId, secret);
const adminToken = () => createToken(adminId, secret);

test('GET /restaurant-categories is public and returns the four labels in enum order', async () => {
  await serve(async (url) => {
    const response = await get(`${url}/restaurant-categories`);
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.deepEqual(body, {
      categories: [
        { key: 'COMIDA_SALUDABLE', label: 'Comida saludable' },
        { key: 'COMIDA_DE_ESTACION', label: 'Comida de estación' },
        { key: 'COMIDA_VEGANA', label: 'Comida vegana' },
        { key: 'COMIDA_CASERA', label: 'Comida casera' },
      ],
    });
  });
});

test('POST /restaurant-requests requires a token and the CLIENTE role', async () => {
  await serve(async (url) => {
    assert.equal((await post(`${url}/restaurant-requests`, requestBody())).status, 401);
    assert.equal(
      (await post(`${url}/restaurant-requests`, requestBody(), createToken(restaurantAdminId, secret))).status,
      403,
    );
    assert.equal((await post(`${url}/restaurant-requests`, requestBody(), adminToken())).status, 403);
    assert.equal(
      (await post(`${url}/restaurant-requests`, requestBody(), createToken(inactiveId, secret))).status,
      401,
    );
  });
});

test('POST /restaurant-requests validates the body before touching the database', async () => {
  await serve(async (url, data) => {
    for (const body of [
      requestBody({ commitmentAccepted: undefined }),
      requestBody({ commitmentAccepted: false }),
      requestBody({ commitmentAccepted: 'true' }),
      requestBody({ status: 'APROBADA' }),
      requestBody({ category: 'COMIDA_RAPIDA' }),
      requestBody({ zoneId: 'no-es-uuid' }),
      { name: 'Solo nombre' },
    ]) {
      const response = await post(`${url}/restaurant-requests`, body, applicantToken());
      assert.equal(response.status, 400, JSON.stringify(body));
    }
    assert.equal(data.calls.filter((call) => call.method.startsWith('solicitudRestaurante.')).length, 0);
  });
});

test('POST /restaurant-requests rejects an inactive zone with 400', async () => {
  await serve(async (url) => {
    const response = await post(
      `${url}/restaurant-requests`, requestBody({ zoneId: inactiveZone.id }), applicantToken());
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { error: 'La zona seleccionada no está disponible.' });
  });
});

test('POST /restaurant-requests creates a PENDIENTE request owned by the token user', async () => {
  await serve(async (url, data) => {
    const response = await post(`${url}/restaurant-requests`, requestBody(), applicantToken());
    assert.equal(response.status, 201);
    const body = await response.json();
    assert.equal(body.request.status, 'PENDIENTE');
    assert.equal(body.request.restaurant.name, 'Verde Bistró');
    assert.equal(body.request.restaurant.address, 'Av. Santa Fe 1234');
    assert.equal(body.request.restaurant.email, 'contacto@verdebistro.test');
    assert.equal(body.request.restaurant.category, 'Comida saludable');
    assert.deepEqual(body.request.zone, { id: zone.id, name: 'Palermo' });
    assert.ok(Date.parse(body.request.commitmentAcceptedAt));
    assert.ok(Date.parse(body.request.submittedAt));
    assert.equal(body.request.reviewedAt, null);
    const create = data.calls.find((call) => call.method === 'solicitudRestaurante.create');
    assert.equal(create.input.data.usuarioId, applicantId);
    assert.equal(create.input.data.estado, 'PENDIENTE');
    assert.ok(create.input.data.fechaAceptacionCompromiso instanceof Date);
    assert.ok(data.calls.some((call) => call.method === 'executeRaw'));
    assert.equal(JSON.stringify(body).includes('hash-must-not-leak'), false);
    assert.equal(JSON.stringify(body).includes('passwordHash'), false);
  });
});

test('POST /restaurant-requests returns 409 on a second pending request', async () => {
  await serve(async (url) => {
    assert.equal(
      (await post(`${url}/restaurant-requests`, requestBody(), applicantToken())).status, 201);
    const second = await post(
      `${url}/restaurant-requests`, requestBody({ email: 'otro@verdebistro.test' }), applicantToken());
    assert.equal(second.status, 409);
    assert.deepEqual(await second.json(), { error: 'Ya tenés una solicitud pendiente o aprobada.' });
  });
});

test('a rejected applicant can reapply with a different email', async () => {
  await serve(async (url) => {
    const created = await post(`${url}/restaurant-requests`, requestBody(), applicantToken());
    assert.equal(created.status, 201);
    const { request } = await created.json();
    const rejected = await post(
      `${url}/admin/restaurant-requests/${request.id}/reject`, {}, adminToken());
    assert.equal(rejected.status, 200);
    const sameEmail = await post(`${url}/restaurant-requests`, requestBody(), applicantToken());
    assert.equal(sameEmail.status, 409);
    const resubmitted = await post(
      `${url}/restaurant-requests`, requestBody({ email: 'nuevo@verdebistro.test' }), applicantToken());
    assert.equal(resubmitted.status, 201);
  });
});

test('GET /restaurant-requests/me returns null or the latest request', async () => {
  await serve(async (url) => {
    assert.equal((await get(`${url}/restaurant-requests/me`)).status, 401);
    const empty = await get(`${url}/restaurant-requests/me`, applicantToken());
    assert.equal(empty.status, 200);
    assert.deepEqual(await empty.json(), { request: null });
    const first = await (await post(
      `${url}/restaurant-requests`, requestBody(), applicantToken())).json();
    const firstId = first.request.id;
    await post(`${url}/admin/restaurant-requests/${firstId}/reject`, {}, adminToken());
    const second = await (await post(
      `${url}/restaurant-requests`, requestBody({ email: 'nuevo@verdebistro.test' }), applicantToken())).json();
    const mine = await get(`${url}/restaurant-requests/me`, applicantToken());
    assert.equal(mine.status, 200);
    const body = await mine.json();
    assert.equal(body.request.id, second.request.id);
    assert.equal(body.request.status, 'PENDIENTE');
    assert.equal(body.request.applicant, undefined);
  });
});

test('GET /admin/restaurant-requests lists by status, oldest first', async () => {
  await serve(async (url) => {
    const client = await get(`${url}/admin/restaurant-requests`, applicantToken());
    assert.equal(client.status, 403);
    const first = await (await post(
      `${url}/restaurant-requests`, requestBody(), applicantToken())).json();
    const second = await (await post(
      `${url}/restaurant-requests`,
      requestBody({ name: 'Otro local', email: 'otro@local.test' }), createToken(applicant2Id, secret))).json();
    await post(`${url}/admin/restaurant-requests/${first.request.id}/reject`, {}, adminToken());

    const pending = await get(`${url}/admin/restaurant-requests`, adminToken());
    assert.equal(pending.status, 200);
    const pendingBody = await pending.json();
    assert.deepEqual(pendingBody.requests.map((row: any) => row.id), [second.request.id]);
    assert.equal(pendingBody.requests[0].applicant.email, 'otro@example.test');
    assert.equal(pendingBody.requests[0].reviewedBy, null);

    const all = await get(`${url}/admin/restaurant-requests?status=TODAS`, adminToken());
    assert.equal(all.status, 200);
    const allBody = await all.json();
    assert.deepEqual(
      allBody.requests.map((row: any) => row.id), [first.request.id, second.request.id]);
    assert.equal(allBody.requests[0].status, 'RECHAZADA');
    assert.equal(allBody.requests[0].reviewedBy.name, 'Admin Plataforma');

    const rejectedOnly = await get(`${url}/admin/restaurant-requests?status=RECHAZADA`, adminToken());
    assert.deepEqual((await rejectedOnly.json()).requests.map((row: any) => row.id), [first.request.id]);

    for (const bad of ['status=foo', 'status=PENDIENTE&status=APROBADA', 'status=']) {
      const response = await get(`${url}/admin/restaurant-requests?${bad}`, adminToken());
      assert.equal(response.status, 400, bad);
    }
  });
});

test('GET /admin/restaurant-requests/:id returns the detail or 404', async () => {
  await serve(async (url) => {
    assert.equal(
      (await get(`${url}/admin/restaurant-requests/no-es-uuid`, adminToken())).status, 404);
    const missing = await get(`${url}/admin/restaurant-requests/${randomUUID()}`, adminToken());
    assert.equal(missing.status, 404);
    assert.deepEqual(await missing.json(), { error: 'Solicitud no encontrada.' });

    const created = await (await post(
      `${url}/restaurant-requests`, requestBody(), applicantToken())).json();
    const detail = await get(
      `${url}/admin/restaurant-requests/${created.request.id}`, adminToken());
    assert.equal(detail.status, 200);
    const body = await detail.json();
    assert.equal(body.request.id, created.request.id);
    assert.deepEqual(body.request.applicant, {
      id: applicantId, name: 'Cliente Solicitante', email: 'cliente@example.test',
    });
    assert.equal(body.request.reviewedBy, null);
    assert.equal(JSON.stringify(body).includes('hash-must-not-leak'), false);
  });
});

test('POST /admin/restaurant-requests/:id/approve creates the restaurant and promotes the user', async () => {
  await serve(async (url, data) => {
    const created = await (await post(
      `${url}/restaurant-requests`, requestBody(), applicantToken())).json();
    const approved = await post(
      `${url}/admin/restaurant-requests/${created.request.id}/approve`, {}, adminToken());
    assert.equal(approved.status, 200);
    const body = await approved.json();
    assert.equal(body.request.status, 'APROBADA');
    assert.ok(Date.parse(body.request.reviewedAt));
    assert.deepEqual(body.request.reviewedBy, { id: adminId, name: 'Admin Plataforma' });
    assert.deepEqual(body.request.applicant, {
      id: applicantId, name: 'Cliente Solicitante', email: 'cliente@example.test',
    });
    assert.equal(JSON.stringify(body).includes('hash-must-not-leak'), false);

    assert.equal(data.restaurantes.length, 1);
    const local = data.restaurantes[0];
    assert.equal(local.nombre, 'Verde Bistró');
    assert.equal(local.direccion, 'Av. Santa Fe 1234');
    assert.equal(local.categoria, 'COMIDA_SALUDABLE');
    assert.equal(local.zonaId, zone.id);
    assert.equal(local.email, 'contacto@verdebistro.test');
    assert.equal(local.activo, true);
    assert.equal(local.esEco, true);
    assert.equal(data.users.get(applicantId).rol, 'RESTAURANTE_ADMIN');
    assert.equal(data.users.get(applicantId).restauranteId, local.id);

    const again = await post(
      `${url}/admin/restaurant-requests/${created.request.id}/approve`, {}, adminToken());
    assert.equal(again.status, 409);
    assert.deepEqual(await again.json(), { error: 'La solicitud ya fue revisada.' });
  });
});

test('approve and reject reject a body with fields and unknown ids', async () => {
  await serve(async (url) => {
    const created = await (await post(
      `${url}/restaurant-requests`, requestBody(), applicantToken())).json();
    for (const action of ['approve', 'reject']) {
      const withFields = await post(
        `${url}/admin/restaurant-requests/${created.request.id}/${action}`,
        { reason: 'no aplica' }, adminToken());
      assert.equal(withFields.status, 400, action);
      assert.deepEqual(await withFields.json(), { error: 'Esta acción no acepta campos.' });
      assert.equal(
        (await post(
          `${url}/admin/restaurant-requests/no-es-uuid/${action}`, {}, adminToken())).status,
        404,
      );
      assert.equal(
        (await post(
          `${url}/admin/restaurant-requests/${randomUUID()}/${action}`, {}, adminToken())).status,
        404,
      );
    }
  });
});

test('approve returns 409 when the applicant cannot become a restaurant admin', async () => {
  await serve(async (url, data) => {
    const created = await (await post(
      `${url}/restaurant-requests`, requestBody(), applicantToken())).json();
    data.users.get(applicantId).activo = false;
    const response = await post(
      `${url}/admin/restaurant-requests/${created.request.id}/approve`, {}, adminToken());
    assert.equal(response.status, 409);
    assert.deepEqual(await response.json(), {
      error: 'El solicitante no puede ser habilitado como restaurante.',
    });
    assert.equal(data.restaurantes.length, 0);
    assert.equal(data.solicitudes[0].estado, 'PENDIENTE');
  });
});

test('reject marks the request without creating a restaurant or changing the role', async () => {
  await serve(async (url, data) => {
    const created = await (await post(
      `${url}/restaurant-requests`, requestBody(), applicantToken())).json();
    const rejected = await post(
      `${url}/admin/restaurant-requests/${created.request.id}/reject`, {}, adminToken());
    assert.equal(rejected.status, 200);
    const body = await rejected.json();
    assert.equal(body.request.status, 'RECHAZADA');
    assert.ok(Date.parse(body.request.reviewedAt));
    assert.deepEqual(body.request.reviewedBy, { id: adminId, name: 'Admin Plataforma' });
    assert.equal(data.restaurantes.length, 0);
    assert.equal(data.users.get(applicantId).rol, 'CLIENTE');
    assert.equal(data.users.get(applicantId).restauranteId, null);

    const approveAfterReject = await post(
      `${url}/admin/restaurant-requests/${created.request.id}/approve`, {}, adminToken());
    assert.equal(approveAfterReject.status, 409);
  });
});

test('reject after approve returns 409 and keeps the assignment', async () => {
  await serve(async (url, data) => {
    const created = await (await post(
      `${url}/restaurant-requests`, requestBody(), applicantToken())).json();
    assert.equal(
      (await post(
        `${url}/admin/restaurant-requests/${created.request.id}/approve`, {}, adminToken())).status,
      200,
    );
    const rejected = await post(
      `${url}/admin/restaurant-requests/${created.request.id}/reject`, {}, adminToken());
    assert.equal(rejected.status, 409);
    assert.equal(data.solicitudes[0].estado, 'APROBADA');
    assert.equal(data.users.get(applicantId).rol, 'RESTAURANTE_ADMIN');
  });
});
