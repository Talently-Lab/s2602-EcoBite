import { randomBytes, randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';

function expect(condition, message) {
  if (!condition) throw new Error(message);
}

export async function checkDeployment(baseUrl, { auth = false, requireData = false, log = console.log } = {}) {
  const base = new URL(baseUrl);
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(base.hostname);
  expect(base.protocol === 'https:' || (local && base.protocol === 'http:'), 'Use HTTPS outside localhost.');
  expect(!base.username && !base.password && !base.search && !base.hash && base.pathname === '/',
    'Provide only the API origin, without credentials, a path, query, or fragment.');

  async function request(path, status, init) {
    const response = await fetch(new URL(path, base), {
      ...init, redirect: 'error', signal: AbortSignal.timeout(120_000),
    });
    expect(response.status === status, `${init?.method ?? 'GET'} ${path}: expected ${status}, got ${response.status}.`);
    log(`PASS ${init?.method ?? 'GET'} ${path} (${status})`);
    return response;
  }

  function post(path, status, body) {
    return request(path, status, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
  }

  const root = await request('/api', 200);
  expect((await root.json()).message === 'API is working!', 'Unexpected API response; the service may still be waking.');
  const spec = await (await request('/api/openapi.yaml', 200)).text();
  expect(/^openapi: 3\.1/m.test(spec) && /- url: \/api\s*$/m.test(spec),
    'OpenAPI must use the deployed server, not localhost.');
  const docs = await (await request('/docs', 200)).text();
  expect(docs.includes('/api/openapi.yaml'), 'Scalar is not pointing at the API specification.');

  const restaurants = await (await request('/api/restaurants', 200)).json();
  expect(Array.isArray(restaurants), 'Restaurants must be an array.');
  expect(restaurants.every((row) => row && typeof row.id === 'string' && typeof row.name === 'string'
    && row.isEco === true && typeof row.zone?.name === 'string'
    && !('passwordHash' in row) && !('email' in row)), 'Unexpected restaurant contract or exposed credentials.');
  expect(!requireData || restaurants.length > 0,
    'No visible restaurants: import approved analyst data and check activo/esEco before the meeting.');
  log(`Restaurants visible: ${restaurants.length}`);
  await request('/api/users/me', 401);

  if (auth) {
    const credentials = { email: `smoke-${randomUUID()}@example.test`, password: randomBytes(24).toString('base64url') };
    const created = await (await post('/api/users/register', 201, {
      name: 'Prueba de despliegue', ...credentials,
    })).json();
    expect(typeof created.user?.id === 'string' && created.user.role === 'CLIENTE'
      && !('passwordHash' in created.user), 'Unexpected registration contract.');
    const session = await (await post('/api/users/login', 200, credentials)).json();
    expect(typeof session.accessToken === 'string' && session.tokenType === 'Bearer',
      'Login did not return a bearer token.');
    const profile = await (await request('/api/users/me', 200, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    })).json();
    expect(profile.user?.id === created.user.id && profile.user.email === credentials.email
      && !('passwordHash' in profile.user), 'Authenticated profile does not match the test account.');
    log('One disposable CLIENTE account was created and remains in the database. Credentials/tokens are not printed.');
  }
}

async function main() {
  const [baseUrl, ...flags] = process.argv.slice(2);
  expect(baseUrl && flags.every((flag) => ['--auth', '--require-data'].includes(flag)),
    'Usage: pnpm --filter backend check:deployed https://YOUR-API.onrender.com [--require-data] [--auth]');
  await checkDeployment(baseUrl, { auth: flags.includes('--auth'), requireData: flags.includes('--require-data') });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(`FAIL ${error instanceof Error ? error.message : 'Deployment check failed.'}`);
    process.exitCode = 1;
  });
}
