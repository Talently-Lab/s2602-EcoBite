# AGENTS.md

## Monorepo (pnpm only)
- `pnpm-workspace.yaml` packages: `frontend`, `backend`. Single root `pnpm-lock.yaml`, `packageManager: pnpm@10.34.5`, Node 22+.
- Root scripts (from repo root): `pnpm dev:frontend` / `pnpm dev:backend` (`--filter`), `pnpm build` (`pnpm -r build`), `pnpm lint` (frontend only). Or `cd frontend|backend` and run package scripts directly. Never `npm`/`yarn`.

## Backend (`backend/`, Express 5 + TS)
- `pnpm dev` = `tsx watch src/index.ts` · `pnpm build` = `tsc` (out `dist/`, `rootDir: src`, `module/nodeResolution: NodeNext`) · `pnpm start` = `node dist/index.js`. No lint/test scripts.
- Env: copy `backend/.env.example` → `backend/.env` (currently only `PORT`, default 3000). Loaded via `import 'dotenv/config'` in `src/index.ts` — keep that import first.
- Entrypoint `src/index.ts` mounts `src/routes/index.route.ts` at `/api`. Only route is a health-check stub; `controllers/`, `services/`, `middlewares/` are empty `.keep` scaffolds, `utils/` is empty. Follow that split when adding features.
- No DB wired yet. Target schema is `docs/database/DER.md` (Usuario/Comercio/Producto/Pedido/Detalle, roles `CLIENTE|COMERCIO|ADMIN`) — don't assume tables/ORM exist.

## Frontend (`frontend/`, Vite 8 + React 19 + Tailwind 4)
- `pnpm dev|build|lint|preview`; `build` = `tsc -b && vite build` (project references `tsconfig.json` → `tsconfig.app.json` + `tsconfig.node.json`, typecheck runs first).
- Entrypoint `src/main.tsx` → `src/router.tsx` (`createBrowserRouter`, lazy `pages/Dashboard`, `pages/NotFound`, `/` → `/dashboard`). `services/`, `context/` are empty `.keep` scaffolds.
- Alias `@/*` → `./src/*` must stay in sync in `vite.config.ts` (`path.resolve(__dirname, "./src")`), `tsconfig.app.json`, and root `tsconfig.json` (`files: []`, `baseUrl: "."`, `ignoreDeprecations: "6.0"`) or shadcn/build breaks.
- Tailwind 4 via `@tailwindcss/vite`, no config file. Tokens live in `src/index.css` (`@theme inline`); keep `@import` order: `tailwindcss`, `tw-animate-css`, `shadcn/tailwind.css`, `@fontsource-variable/inter`.
- shadcn (`components.json`): style `base-vega`, `rsc: false`, css `src/index.css`, `baseColor: neutral`, `cssVariables: true`, icon `lucide`. `cn()` is a re-export from the `cn` package in `src/lib/utils.ts` — import via `@/lib/utils`, UI via `@/components/ui/<name>`. Add components with `pnpm dlx shadcn@latest add <name>` from `frontend/`.
- Lint is `oxlint` (`.oxlintrc.json`), not ESLint. No tests, no CI — don't invent a test runner.
