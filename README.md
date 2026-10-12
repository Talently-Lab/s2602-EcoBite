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
- PostgreSQL 16 (Docker) + Prisma 7 (ORM)
- dotenv (variables de entorno), tsx (dev)
- API REST bajo `/api`

## Requisitos

- Node.js 22+
- pnpm 10+
- Docker Desktop (base de datos local del backend)

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
pnpm dev              # tsx watch src/index.ts
pnpm build            # prisma generate && tsc
pnpm start            # node dist/index.js
pnpm prisma:migrate   # crea/aplica migraciones (desarrollo)
pnpm prisma:generate  # regenera el cliente de Prisma
pnpm prisma:seed      # carga zonas y empaques
pnpm prisma:studio    # explorar la base de datos
```

### Primera puesta en marcha del backend

```bash
cd backend
cp .env.example .env
docker compose up -d          # levanta PostgreSQL
pnpm exec prisma migrate deploy
pnpm prisma:generate
pnpm prisma:seed
pnpm dev
```

## Variables de entorno

Copiar `backend/.env.example` a `backend/.env`:

```bash
PORT=3000
DATABASE_URL="postgresql://ecobite:ecobite@localhost:5432/ecobite?schema=public"
```

Las credenciales son solo para la base de datos local de Docker.

## Estructura

```text
frontend/       # App Vite + React
backend/src/    # API Express (controllers, routes, services, middlewares, utils)
backend/prisma/ # Esquema, migraciones y seed de la base de datos
docs/database/  # DER del modelo de datos
```

## Documentación

- [DER — Diagrama Entidad-Relación](docs/database/DER.md)
