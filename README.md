# EcoBite

Startup FoodTech que conecta usuarios con restaurantes locales que usan envases 100% biodegradables y entregas sin emisiones (bicicletas o vehículos eléctricos).

Primer MVP para validar el modelo de negocio, medir el impacto ambiental real (ahorro de huella de carbono) y comenzar la captación de clientes con una identidad visual sólida.

## Stack

### Frontend (`frontend/`)

- Vite 8 + React 19 + TypeScript
- Tailwind CSS 4 + shadcn + Base UI
- React Router 7, Lucide, Inter Variable
- Lint: oxlint · Package manager: pnpm

### Backend (`backend/`)

- Node.js + Express 5 + TypeScript
- dotenv (variables de entorno), tsx (dev)
- API REST bajo `/api`

## Requisitos

- Node.js 22+
- pnpm 10+

## Instalación

```bash
pnpm install
```

## Uso

```bash
# Frontend (desde frontend/)
pnpm dev      # servidor Vite
pnpm build    # tsc -b && vite build
pnpm lint     # oxlint
pnpm preview  # servir build

# Backend (desde backend/)
pnpm dev      # tsx watch src/index.ts
pnpm build    # tsc
pnpm start    # node dist/index.js
```

## Variables de entorno

Copiar `backend/.env.example` a `backend/.env`:

```bash
PORT=3000
```

## Estructura

```text
frontend/       # App Vite + React
backend/src/    # API Express (controllers, routes, services, middlewares, utils)
docs/database/  # DER del modelo de datos
```

## Documentación

- [DER — Diagrama Entidad-Relación](docs/database/DER.md)
