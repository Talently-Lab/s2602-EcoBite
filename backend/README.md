# EcoBite API

Express 5 + TypeScript, PostgreSQL y Prisma 7. Las rutas están bajo `/api`.
Los controladores gestionan HTTP, los servicios acceden a Prisma y los
middlewares gestionan autenticación y errores. No se devuelven hashes.

## Desarrollo local

Desde la raíz del monorepo:

```sh
pnpm install --frozen-lockfile
```

Configurar `backend/.env` a partir de `.env.example`, o inyectar las variables
con Doppler en un proyecto/configuración dedicado a EcoBite. No compartir los
valores ni versionar el archivo `.env`.

| Variable | Uso |
| --- | --- |
| `PORT` | Puerto del servidor; por defecto `3000`. |
| `DATABASE_URL` | Conexión PostgreSQL. |
| `JWT_SECRET` | Secreto aleatorio de al menos 32 bytes, obligatorio. |
| `CORS_ORIGINS` | Orígenes exactos separados por comas, sin rutas. En desarrollo se admite por defecto `http://localhost:5173`; en producción ninguno si no se configura. |

Generar el secreto con un gestor de secretos o `openssl rand -hex 32` y guardarlo
directamente en `.env` o Doppler; no pegarlo en chat ni documentación.

Con Docker disponible, desde `backend/`:

```sh
docker compose up -d
pnpm prisma:migrate
pnpm prisma:generate
pnpm prisma:seed
```

Aplicar migraciones únicamente a la base local destinada al proyecto.
El seed actual carga zonas y empaques; no inventa restaurantes ni productos.
Por eso una base recién inicializada puede devolver `[]` en restaurantes.

Desde la raíz: `pnpm dev:backend`. Desde `backend/`: `pnpm dev`.
El servidor valida la configuración y ejecuta `SELECT 1` antes de escuchar.
`GET /api` solo confirma que el proceso responde: **no es monitoreo de servicios**.

## Contrato HTTP

Enviar `Content-Type: application/json` en los POST. Límite del cuerpo: 16 KiB.
Las respuestas no deben almacenarse en caché. Los errores tienen el formato
`{"error":"mensaje"}` sin stack trace ni datos internos.

### `GET /api/restaurants`

Público. Devuelve un array, únicamente restaurantes activos y eco-friendly,
ordenados por nombre e ID. No incluye email ni contraseña del restaurante.

```ts
Array<{
  id: string;
  name: string;
  category: string | null;
  isEco: boolean;
  zone: { id: string; name: string };
}>
```

El esquema actual no tiene imágenes ni descripción comercial del restaurante.
El frontend aún espera `description`, `imageSrc` y `tag` en su tipo de tarjeta:
necesita un adaptador/ajuste de contrato en una tarea posterior. No se inventan
estos datos ni se modifica el frontend en este cambio.

### `POST /api/users/register`

```json
{ "name": "Nombre del cliente", "email": "cliente@example.test", "password": "<contraseña>" }
```

- Los tres campos son obligatorios; se rechazan campos adicionales.
- Nombre recortado, 1–120 caracteres sin controles.
- Email recortado y convertido a minúsculas; máximo 254 caracteres.
- Contraseña de al menos 8 caracteres y máximo 72 **bytes UTF-8**, para evitar
  truncamiento silencioso de bcrypt. No se recorta ni modifica.
- bcrypt con costo 12. El rol siempre es `CLIENTE`; no hay registro público de admins.
- `201`: `{"user":{id,name,email,role,createdAt}}`.
- `400`: datos inválidos. `409`: email duplicado (incluye registros concurrentes).

La política de 8 caracteres es el mínimo inicial, no una garantía de fortaleza.
La comprobación de contraseñas comprometidas y la verificación de email quedan
pendientes antes de una apertura pública.

### `POST /api/users/login`

```json
{ "email": "cliente@example.test", "password": "<contraseña>" }
```

`200`: `{accessToken, tokenType:"Bearer", expiresIn:3600, user:{id,name,email,role,createdAt}}`.
Email desconocido, contraseña incorrecta y cuenta inactiva responden el mismo
`401`. Datos faltantes o inválidos: `400`. También se realiza trabajo bcrypt
para emails desconocidos.

JWT HS256: duración 1 hora, `sub` = UUID del usuario, issuer `ecobite-api`,
audience `ecobite-customer`. Sin contraseñas, email u otros datos personales.
El secreto es exclusivo de la autenticación de clientes, no del OAuth del portal.

### `GET /api/users/me`

Protegido: `Authorization: Bearer <accessToken>`.
`200`: `{"user":{id,name,email,role,createdAt}}`.
`401`: token ausente, inválido, vencido o usuario eliminado/inactivo.
La cuenta se consulta nuevamente; desactivarla invalida el acceso inmediatamente.

No hay refresh tokens ni endpoint de logout. El frontend debe desechar el token
al cerrar sesión; un token robado permanece válido hasta su vencimiento salvo
desactivación de la cuenta o rotación del secreto. No persistirlo por defecto
en `localStorage`; acordar la estrategia de sesión con frontend antes de producción.

## Límites operativos

- Registro y login comparten 20 intentos por IP cada 15 minutos (`429` con
  `Retry-After`). El store es en memoria: se reinicia con el proceso y no comparte
  contadores entre réplicas. Usar un store compartido antes de escalar.
- Express no confía automáticamente en `X-Forwarded-For`. Tras un proxy,
  configurar `trust proxy` solo para el proxy real; no usar `true` indiscriminadamente.
  Sin configuración, usuarios tras ese proxy podrían compartir un límite.
- CORS limita qué orígenes de navegador pueden leer respuestas; **no reemplaza
  autenticación** ni bloquea clientes como curl.
- El registro revela duplicados con `409`; el login no distingue si el email existe.
  Revisar esa política si el servicio se abre públicamente.
- No hay paginación todavía: el alcance inicial del dataset tiene un restaurante.
- Algunos errores de conexión/timeout de Prisma responden `503`. Otros errores
  inesperados responden `500`, sin filtrar mensajes internos.
- Los emails existentes importados por otro mecanismo deben respetar la
  normalización a minúsculas. Este cambio no modifica datos existentes.

## Verificación

Con las variables configuradas:

```sh
pnpm --filter backend build
pnpm --filter backend check:api
```

`check:api` usa el runner integrado de Node y `tsx`, sin framework nuevo.
Prueba HTTP real en un puerto efímero, bcrypt/JWT reales y un doble de Prisma.
No conecta a PostgreSQL: **no valida migraciones, constraints reales ni queries
contra la base**. Comprobar también registro → login → `/users/me` sobre una
base local aislada antes de integrar con frontend.

La importación del Excel/CSV de Rebeca queda fuera de este cambio: faltan los
archivos fuente y siguen pendientes las decisiones de roles/estados.
