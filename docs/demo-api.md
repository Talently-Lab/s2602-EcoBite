# EcoBite meeting sheet

## URLs

Requested hostnames below must be confirmed in the provider dashboards.

```text
Portal:        https://ecobite-api-portal.vercel.app
Scalar:        https://ecobite-api.onrender.com/docs
API origin:    https://ecobite-api.onrender.com
API base:      https://ecobite-api.onrender.com/api
Specification: https://ecobite-api.onrender.com/api/openapi.yaml
```

## Before the meeting

Verified live on 2026-10-16: API, Scalar, portal, the `/docs` redirect, and real
restaurant data (`GET /api/restaurants` returns the imported dataset).

- Deployment: live on Render + Neon + Vercel.
- Analyst import: applied; `/api/restaurants` exposes the active eco rows.
- Encrypted backup workflow exists; confirm the latest artifact is downloaded.
  An isolated restore drill is still pending.

Even if an external monitor keeps the service warm, open `/api` and `/docs` five
minutes before presenting: it takes seconds and proves the state you will show.
If a warm-up returns a loading page or temporary error, wait about a minute for
the Free service to wake up and rerun the checks. Free hosting cannot guarantee
immediate availability.

## Terminal checks

From the repository root (Node 22+ and pnpm installed):

```powershell
pnpm --filter backend check:deployed https://ecobite-api.onrender.com --require-data
```

This is read-only. It checks process liveness, same-origin OpenAPI, Scalar HTML,
real restaurant responses, and a `401` when no bearer token is provided.
`--require-data` fails if no restaurants are visible: an empty database is not a
successful data demonstration.

To additionally test register -> login -> authenticated profile:

```powershell
pnpm --filter backend check:deployed https://ecobite-api.onrender.com --require-data --auth
```

**Each `--auth` run creates one new disposable CLIENTE account that remains in
the database.** It does not delete anything or print credentials/tokens. Use it
only when you intend to create test data. Default checks do not write data.

Check the portal's redirect separately:

```powershell
curl.exe -I --max-time 120 https://ecobite-api-portal.vercel.app/docs
```

Expect a redirect with `Location: https://ecobite-api.onrender.com/docs`, never a
localhost URL. Also open it in the browser to verify the actual Scalar UI.

## Scalar demonstration

The terminal tester and browser tester can work at the same time. Use a separate
browser demo account, not the automated test's generated account.

| Order | Request | Expected |
| --- | --- | --- |
| 1 | `GET /api/restaurants` | `200`, nonempty approved analyst data; no email/hash fields. |
| 2 | `GET /api/users/me` without auth | `401`. |
| 3 | `POST /api/users/register` | `201`, public user profile with role `CLIENTE`. |
| 4 | `POST /api/users/login` | `200`, bearer token and public user profile. |
| 5 | `GET /api/users/me` with bearer token | `200`, the same user's profile. |

Registration body (replace placeholders in Scalar; do not save credentials here):

```json
{
  "name": "Demo EcoBite",
  "email": "YOUR_UNIQUE_DEMO_EMAIL@example.test",
  "password": "YOUR_DEMO_PASSWORD"
}
```

Use a disposable password, at least 8 characters and at most 72 UTF-8 bytes.
Keep the chosen demo credentials in a password manager for the meeting.

Login body:

```json
{
  "email": "YOUR_UNIQUE_DEMO_EMAIL@example.test",
  "password": "YOUR_DEMO_PASSWORD"
}
```

After login, copy `accessToken` into Scalar's bearer-auth field. It supplies
`Authorization: Bearer <accessToken>`; do not add `Bearer` twice. The token
expires after one hour: log in again before the meeting if needed. Do not
include the token in screenshots, the sheet, source files, or chat.

Register once, then reuse login. Registering the same email again gives `409`;
that is expected, not database loss. Invalid credentials give `401`; malformed
JSON/input gives `400`; an incorrect media type gives `415`. Registration and
login share 20 attempts per IP per 15 minutes (`429` with `Retry-After`).

## If something fails

- `/api` works but restaurants give `503`: inspect Neon availability/connection
  settings and Render logs. `/api` alone does not prove database readiness.
- Restaurants give `[]`: check that the approved import ran against this same
  Neon database and that the rows are active and eco-friendly. Do not invent data.
- Scalar tries localhost: confirm the deployed OpenAPI has `servers: /api`.
- Portal redirects incorrectly: set Vercel's `API_DOCS_URL` and redeploy.
- Browser CORS fails: allow the exact customer frontend origin in Render.
  Terminal access is not controlled by CORS.
- Existing rows disappear after redeploy: first compare the Neon project,
  branch, and database in the configured URI. Do not reset or re-import blindly.

Backups and recovery instructions are in [deployment.md](deployment.md).
