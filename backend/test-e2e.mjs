// Temporary E2E smoke test for the restaurant-request flow + approval email.
// Reads admin creds from backend/.env without printing them.
import { readFileSync } from 'node:fs';

const BASE = process.env.API_URL || 'http://localhost:3000';
const USER_EMAIL = 'naferjml@gmail.com';
const USER_PASS = 'EcoBite1234';

const env = Object.fromEntries(
  readFileSync('.env', 'utf8').split('\n')
    .filter((l) => l.includes('=') && !l.startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim().replace(/^"|"$/g, '')]),
);
const ADMIN_EMAIL = env.SEED_ADMIN_EMAIL;
const ADMIN_PASS = env.SEED_ADMIN_PASSWORD;

let step = 0;
function log(title, data) {
  step++;
  console.log(`\n=== ${step}. ${title} ===`);
  if (data !== undefined) console.log(JSON.stringify(data, null, 2));
}

async function call(method, path, { token, body } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text; }
  return { status: res.status, json };
}

function must(cond, msg) {
  if (!cond) { console.error(`FAIL: ${msg}`); process.exit(1); }
}

// 1. Register client user (409 = already exists, then just login)
let r = await call('POST', '/api/users/register', { body: { name: 'Nahuel Test', email: USER_EMAIL, password: USER_PASS } });
log('POST /users/register', { status: r.status, body: r.json });
must([201, 409].includes(r.status), `register -> ${r.status}`);

function tok(r) { return r.json?.token?.accessToken ?? r.json?.accessToken ?? r.json?.token; }

// 2. Login as client
r = await call('POST', '/api/users/login', { body: { email: USER_EMAIL, password: USER_PASS } });
log('POST /users/login (client)', { status: r.status, token: tok(r) ? '[received]' : r.json });
must(r.status === 200 && tok(r), `client login -> ${r.status}`);
const userToken = tok(r);

// 3. Public endpoints: zones + categories
r = await call('GET', '/api/zones');
const zona = r.json?.zones?.[0] ?? r.json?.[0];
log('GET /zones (first)', { status: r.status, count: (r.json?.zones ?? r.json)?.length, first: zona });
must(r.status === 200 && zona?.id, 'zones list');

r = await call('GET', '/api/restaurant-categories');
log('GET /restaurant-categories', { status: r.status, body: r.json });
const category = r.json?.categories?.[0]?.key ?? r.json?.[0]?.key;
must(r.status === 200 && category, 'categories list');

// 4. Submit restaurant request
const reqBody = {
  name: 'Verde Test Nafer',
  category,
  zoneId: zona.id,
  address: 'Av. Corrientes 1234, CABA',
  email: USER_EMAIL,
  commitmentAccepted: true,
};
r = await call('POST', '/api/restaurant-requests', { token: userToken, body: reqBody });
log('POST /restaurant-requests', { status: r.status, body: r.json });
must([201, 409].includes(r.status), `submit -> ${r.status}`);

// 5. My request
r = await call('GET', '/api/restaurant-requests/me', { token: userToken });
log('GET /restaurant-requests/me', { status: r.status, body: r.json });
const requestId = r.json?.request?.id;
must(r.status === 200 && requestId, 'my request');
must(r.json.request.status === 'PENDIENTE', `status should be PENDIENTE, got ${r.json.request.status}`);

// 6. Admin login
r = await call('POST', '/api/users/login', { body: { email: ADMIN_EMAIL, password: ADMIN_PASS } });
log('POST /users/login (admin)', { status: r.status, token: tok(r) ? '[received]' : r.json });
must(r.status === 200 && tok(r), `admin login -> ${r.status}`);
const adminToken = tok(r);

// 7. Admin lists pending requests
r = await call('GET', '/api/admin/restaurant-requests?status=PENDIENTE', { token: adminToken });
const list = r.json?.requests ?? r.json;
log('GET /admin/restaurant-requests?status=PENDIENTE', { status: r.status, count: list?.length });
must(r.status === 200 && list.some((x) => x.id === requestId), 'request visible to admin');

// 8. Client cannot approve (authz check)
r = await call('POST', `/api/admin/restaurant-requests/${requestId}/approve`, { token: userToken, body: {} });
log('POST approve as CLIENT (should fail 403)', { status: r.status, body: r.json });
must(r.status === 403, `client approve should be 403, got ${r.status}`);

// 9. Admin approves -> transaction + email trigger
r = await call('POST', `/api/admin/restaurant-requests/${requestId}/approve`, { token: adminToken, body: {} });
log('POST approve as ADMIN', { status: r.status, body: r.json });
must(r.status === 200 && r.json?.request?.status === 'APROBADA', `approve -> ${r.status}`);

// 10. Request now APROBADA
r = await call('GET', '/api/restaurant-requests/me', { token: userToken });
log('GET /restaurant-requests/me (after)', { status: r.status, status: r.json?.request?.status });
must(r.json?.request?.status === 'APROBADA', 'request should be APROBADA');

// 11. User promoted: re-login to get fresh role
r = await call('POST', '/api/users/login', { body: { email: USER_EMAIL, password: USER_PASS } });
const userToken2 = tok(r);
r = await call('GET', '/api/users/me', { token: userToken2 });
log('GET /users/me (role check)', { status: r.status, body: r.json });
must(r.json?.user?.role === 'RESTAURANTE_ADMIN', `role should be RESTAURANTE_ADMIN, got ${r.json?.user?.role}`);

// 12. Restaurant now exists in public catalog
r = await call('GET', '/api/restaurants');
const rests = r.json?.restaurants ?? r.json;
const mine = rests?.find?.((x) => x.email === USER_EMAIL || x.name === 'Verde Test Nafer');
log('GET /restaurants (find mine)', { status: r.status, total: rests?.length, mine: mine ?? 'not found' });
must(mine, 'restaurant should appear in public catalog');

console.log('\n*** ALL CHECKS PASSED ***');
console.log('Email send is fire-and-forget: check the API log for "[email] approval send failed" and your inbox.');
