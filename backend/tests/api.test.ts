import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { randomBytes, randomUUID } from 'node:crypto';
import { once } from 'node:events';
import type { Server } from 'node:http';
import { join } from 'node:path';
import { test } from 'node:test';
import { promisify } from 'node:util';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { checkDeployment } from '../scripts/check-deployed.mjs';
import { createApp } from '../src/app';
import type { PrismaClient } from '../src/generated/prisma/client';
import { readConfig } from '../src/lib/config';
import { createToken } from '../src/lib/tokens';

const secret = randomBytes(32).toString('hex');
const userId = randomUUID();
const user = {
  id: userId, nombreCompleto: 'Cliente de prueba', email: 'cliente@example.test',
  rol: 'CLIENTE', fechaRegistro: new Date('2026-01-01T00:00:00Z'), activo: true,
};

function fixture() {
  const calls: { method: string; input: any }[] = [];
  let saved: typeof user & { passwordHash: string } | null = null;
  let failure: unknown;
  const db = {
    usuario: {
      async create(input: any) {
        calls.push({ method: 'create', input });
        if (failure) throw failure;
        if (saved) throw { code: 'P2002' };
        saved = { ...user, ...input.data };
        return saved;
      },
      async findUnique(input: any) {
        calls.push({ method: 'findUnique', input });
        if (failure) throw failure;
        return saved && (input.where.id === saved.id || input.where.email === saved.email) ? saved : null;
      },
    },
    restaurante: {
      async findMany(input: any) {
        calls.push({ method: 'findMany', input });
        if (failure) throw failure;
        return [{
          id: randomUUID(), nombre: 'Local de prueba', categoria: null, esEco: true,
          zona: { id: randomUUID(), nombreBarrio: 'Zona de prueba' },
          passwordHash: 'must-not-leak', email: 'private@example.test',
        }];
      },
    },
  };
  return {
    db: db as unknown as PrismaClient, calls,
    deactivate() { if (saved) saved.activo = false; },
    fail(error: unknown) { failure = error; },
  };
}

async function serve(run: (url: string, data: ReturnType<typeof fixture>) => Promise<void>, trustProxyHops: 0 | 1 = 0) {
  const data = fixture();
  const server: Server = createApp(data.db, { jwtSecret: secret, corsOrigins: ['http://localhost:5173'], trustProxyHops })
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

function post(url: string, body: unknown) {
  return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
}

const registration = { name: 'Cliente de prueba', email: ' Cliente@Example.Test ', password: 'valid-password' };

test('configuration rejects missing/short secrets and wildcard or path origins', () => {
  for (const env of [{}, { JWT_SECRET: 'short' }, { JWT_SECRET: secret, CORS_ORIGINS: '*' },
    { JWT_SECRET: secret, CORS_ORIGINS: 'https://example.test/path' }]) {
    assert.throws(() => readConfig(env));
  }
  assert.deepEqual(readConfig({ JWT_SECRET: secret, NODE_ENV: 'production' }).corsOrigins, []);
  assert.deepEqual(readConfig({ JWT_SECRET: secret }).corsOrigins, ['http://localhost:5173']);
});

test('proxy trust is disabled by default and only allows direct or one controlled proxy', () => {
  assert.equal(readConfig({ JWT_SECRET: secret }).trustProxyHops, 0);
  assert.equal(readConfig({ JWT_SECRET: secret, TRUST_PROXY_HOPS: '1' }).trustProxyHops, 1);
  for (const value of ['true', '-1', '2', '1.5', 'loopback', '']) {
    assert.throws(() => readConfig({ JWT_SECRET: secret, TRUST_PROXY_HOPS: value }));
  }
});

test('root is exact; unknown routes and unsupported methods return 404', async () => {
  await serve(async (url) => {
    assert.equal((await fetch(url)).status, 200);
    assert.equal((await fetch(`${url}/missing`)).status, 404);
    assert.equal((await fetch(`${url}/restaurants`, { method: 'DELETE' })).status, 404);
  });
});

test('restaurants use active/eco filtering and exclude credentials', async () => {
  await serve(async (url, data) => {
    const response = await fetch(`${url}/restaurants`);
    assert.equal(response.status, 200);
    const rows = await response.json();
    assert.equal(rows[0].name, 'Local de prueba');
    assert.equal(rows[0].category, null);
    assert.equal(rows[0].isEco, true);
    assert.deepEqual(data.calls[0].input.where, { activo: true, esEco: true });
    assert.equal(data.calls[0].input.select.passwordHash, undefined);
    assert.equal(data.calls[0].input.select.email, undefined);
    assert.equal(JSON.stringify(rows).includes('must-not-leak'), false);
  });
});

test('register -> login -> protected me uses real bcrypt and JWT without leaking hashes', async () => {
  await serve(async (url, data) => {
    const created = await post(`${url}/users/register`, registration);
    assert.equal(created.status, 201);
    const body = await created.json();
    assert.equal(body.user.email, 'cliente@example.test');
    assert.equal(body.user.role, 'CLIENTE');
    assert.equal(body.user.passwordHash, undefined);
    const hash = data.calls[0].input.data.passwordHash;
    assert.notEqual(hash, registration.password);
    assert.equal(await bcrypt.compare(registration.password, hash), true);
    assert.equal(bcrypt.getRounds(hash), 12);
    assert.equal((await post(`${url}/users/register`, registration)).status, 409);

    const login = await post(`${url}/users/login`, { email: registration.email, password: registration.password });
    assert.equal(login.status, 200);
    const session = await login.json();
    assert.equal(session.tokenType, 'Bearer');
    assert.equal(session.expiresIn, 3600);
    const payload = jwt.verify(session.accessToken, secret) as jwt.JwtPayload;
    assert.equal(payload.sub, userId);
    assert.equal(payload.password, undefined);
    assert.equal(payload.email, undefined);
    assert.equal(payload.exp! - payload.iat!, 3600);
    const me = await fetch(`${url}/users/me`, { headers: { Authorization: `Bearer ${session.accessToken}` } });
    assert.equal(me.status, 200);
    assert.deepEqual(await me.json(), body);
    data.deactivate();
    assert.equal((await fetch(`${url}/users/me`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    })).status, 401);
    assert.equal((await post(`${url}/users/login`, registration)).status, 401);
  });
});

test('registration rejects missing, malformed, too long and privilege-escalation input before DB calls', async () => {
  await serve(async (url, data) => {
    for (const body of [
      null, [], {}, { ...registration, name: '' }, { ...registration, name: 'x'.repeat(121) },
      { ...registration, email: 'invalid' }, { ...registration, password: 123 },
      { ...registration, password: 'short' }, { ...registration, password: 'é'.repeat(37) },
      { ...registration, role: 'ADMIN' }, { ...registration, role: 'ADMIN_PLATAFORMA' },
      { ...registration, role: 'RESTAURANTE_ADMIN' }, { ...registration, rol: 'ADMIN_PLATAFORMA' },
      { ...registration, activo: true },
    ]) {
      assert.equal((await post(`${url}/users/register`, body)).status, 400);
    }
    assert.equal(data.calls.length, 0);
  });
});

test('unknown email and wrong password return the same login failure', async () => {
  await serve(async (url) => {
    await post(`${url}/users/register`, registration);
    const wrong = await post(`${url}/users/login`, { email: registration.email, password: 'wrong-password' });
    const missing = await post(`${url}/users/login`, { email: 'absent@example.test', password: 'wrong-password' });
    assert.equal(wrong.status, 401);
    assert.equal(missing.status, 401);
    assert.deepEqual(await wrong.json(), await missing.json());
  });
});

test('missing, malformed, expired, wrong signature/algorithm/audience and missing-exp tokens are rejected', async () => {
  const claims = { subject: userId, issuer: 'ecobite-api', audience: 'ecobite-customer' };
  await serve(async (url) => {
    for (const authorization of [
      '', 'Basic abc', 'Bearer abc', 'Bearer a b',
      `Bearer ${jwt.sign({}, secret, { ...claims, expiresIn: -1 })}`,
      `Bearer ${jwt.sign({}, 'different-secret', { ...claims, expiresIn: 3600 })}`,
      `Bearer ${jwt.sign({}, secret, { ...claims, algorithm: 'HS384', expiresIn: 3600 })}`,
      `Bearer ${jwt.sign({}, secret, { ...claims, audience: 'other', expiresIn: 3600 })}`,
      `Bearer ${jwt.sign({}, secret, claims)}`,
      `Bearer ${createToken(randomUUID(), secret)}`,
    ]) {
      assert.equal((await fetch(`${url}/users/me`, { headers: { Authorization: authorization } })).status, 401);
    }
  });
});

test('OpenAPI spec and Scalar docs are served', async () => {
  await serve(async (url) => {
    const spec = await fetch(`${url}/openapi.yaml`);
    assert.equal(spec.status, 200);
    assert.match(spec.headers.get('content-type') ?? '', /yaml/);
    const specBody = await spec.text();
    assert.match(specBody, /^openapi: 3\.1/m);
    assert.match(specBody, /\/users\/register:/);
    assert.match(specBody, /- url: \/api\s*$/m);
    assert.doesNotMatch(specBody, /localhost/);
    const docs = await fetch(new URL('/docs', url));
    assert.equal(docs.status, 200);
    assert.match(docs.headers.get('content-type') ?? '', /text\/html/);
    const html = await docs.text();
    assert.match(html, /"url": "\/api\/openapi\.yaml"/);
    assert.doesNotMatch(html, /"spec"\s*:/);
    assert.match(html, /https:\/\/cdn\.jsdelivr\.net\/npm\/@scalar\/api-reference@\d+\.\d+\.\d+\/esm\.js/);
  });
});

test('JSON media type, malformed JSON and body limit use explicit status codes', async () => {
  await serve(async (url) => {
    assert.equal((await fetch(`${url}/users/register`, { method: 'POST', body: 'text' })).status, 415);
    assert.equal((await fetch(`${url}/users/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{',
    })).status, 400);
    assert.equal((await post(`${url}/users/register`, { ...registration, name: 'x'.repeat(17000) })).status, 413);
  });
});

test('CORS only grants the configured origin and API responses are not cached', async () => {
  await serve(async (url) => {
    const allowed = await fetch(url, { headers: { Origin: 'http://localhost:5173' } });
    assert.equal(allowed.headers.get('access-control-allow-origin'), 'http://localhost:5173');
    assert.equal(allowed.headers.get('cache-control'), 'no-store');
    assert.equal(allowed.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(allowed.headers.get('x-powered-by'), null);
    const denied = await fetch(url, { headers: { Origin: 'https://unapproved.test' } });
    assert.equal(denied.headers.get('access-control-allow-origin'), null);
    const preflight = await fetch(`${url}/users/login`, {
      method: 'OPTIONS', headers: { Origin: 'http://localhost:5173', 'Access-Control-Request-Method': 'POST' },
    });
    assert.equal(preflight.status, 204);
  });
});

test('DB unavailable returns 503, not fabricated restaurants', async () => {
  await serve(async (url, data) => {
    data.fail({ code: 'P1001' });
    const response = await fetch(`${url}/restaurants`);
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { error: 'Servicio temporalmente no disponible.' });
  });
});

test('registration and login share an IP rate limit', async () => {
  await serve(async (url) => {
    for (let index = 0; index < 20; index++) {
      const path = index % 2 ? 'register' : 'login';
      const response = await post(`${url}/users/${path}`, {});
      assert.equal(response.status, 400);
      assert.match(response.headers.get('ratelimit') ?? '', /r=\d+; t=\d+/);
      assert.match(response.headers.get('ratelimit-policy') ?? '', /q=20; w=900;/);
    }
    const response = await post(`${url}/users/login`, {});
    assert.equal(response.status, 429);
    assert.ok(response.headers.get('retry-after'));
    assert.match(response.headers.get('ratelimit') ?? '', /r=0; t=\d+/);
    assert.match(response.headers.get('ratelimit-policy') ?? '', /q=20; w=900;/);
    assert.equal((await fetch(`${url}/restaurants`)).status, 200);
  });
});

test('rate-limit headers are conditional on reaching the auth limiter', async () => {
  await serve(async (url, data) => {
    for (const [response, status] of [
      [await fetch(`${url}/users/login`, { method: 'POST', body: 'text' }), 415],
      [await fetch(`${url}/users/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{',
      }), 400],
      [await post(`${url}/users/login`, { password: 'x'.repeat(17000) }), 413],
      [await fetch(`${url}/restaurants`), 200],
    ] as const) {
      assert.equal(response.status, status);
      assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
      assert.equal(response.headers.get('ratelimit'), null);
      assert.equal(response.headers.get('ratelimit-policy'), null);
    }
    data.fail({ code: 'P1001' });
    const unavailable = await post(`${url}/users/login`, registration);
    assert.equal(unavailable.status, 503);
    assert.match(unavailable.headers.get('ratelimit') ?? '', /r=19; t=\d+/);
    assert.match(unavailable.headers.get('ratelimit-policy') ?? '', /q=20; w=900;/);
  });
});

test('one trusted proxy isolates client limits and ignores spoofed earlier forwarded addresses', async () => {
  await serve(async (url) => {
    async function login(forwarded: string) {
      return fetch(`${url}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': forwarded },
        body: '{}',
      });
    }
    for (let index = 0; index < 20; index++) {
      assert.equal((await login('198.51.100.10')).status, 400);
    }
    const limited = await login('203.0.113.99, 198.51.100.10');
    assert.equal(limited.status, 429);
    assert.ok(limited.headers.get('retry-after'));
    assert.equal((await login('198.51.100.11')).status, 400);
  }, 1);
});

test('deployment smoke checks cover docs, data and optional auth without logging credentials', async () => {
  await serve(async (url) => {
    const logs: string[] = [];
    await checkDeployment(new URL(url).origin, { auth: true, requireData: true, log: (line: string) => logs.push(line) });
    const output = logs.join('\n');
    assert.match(output, /GET \/api\/users\/me \(401\)/);
    assert.match(output, /GET \/api\/users\/me \(200\)/);
    assert.doesNotMatch(output, /eyJ|smoke-[a-f0-9-]+@|passwordHash/);
  });
});

test('deployment smoke checks reject empty analyst data, unavailable DB and unsafe origins', async () => {
  await serve(async (url, data) => {
    const origin = new URL(url).origin;
    await assert.rejects(checkDeployment(`${origin}/api`), /only the API origin/);
    await assert.rejects(checkDeployment('http://example.test'), /HTTPS/);
    await assert.rejects(checkDeployment('https://user:password@example.test'), /without credentials/);
    data.db.restaurante.findMany = async () => [];
    await assert.rejects(checkDeployment(origin, { requireData: true, log: () => {} }), /No visible restaurants/);
  });
  await serve(async (url, data) => {
    data.fail({ code: 'P1001' });
    await assert.rejects(checkDeployment(new URL(url).origin, { log: () => {} }), /expected 200, got 503/);
  });
});

test('native deployment CLI is read-only by default and rejects unknown flags before requests', async () => {
  await serve(async (url, data) => {
    const run = promisify(execFile);
    const script = join(__dirname, '..', 'scripts', 'check-deployed.mjs');
    const origin = new URL(url).origin;
    const result = await run(process.execPath, [script, origin, '--require-data']);
    assert.match(result.stdout, /PASS GET \/api\/restaurants \(200\)/);
    assert.ok(data.calls.every((call) => call.method === 'findMany'));
    const count = data.calls.length;
    await assert.rejects(run(process.execPath, [script, origin, '--unsupported']),
      (error: any) => error.code === 1 && error.stderr.includes('Usage:'));
    assert.equal(data.calls.length, count);
  });
});
