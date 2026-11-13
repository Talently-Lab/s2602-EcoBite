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
| `DIRECT_URL` | Opcional: conexión directa para migraciones; en Neon evita el pooler. El runtime y seed siguen usando `DATABASE_URL`. |
| `JWT_SECRET` | Secreto aleatorio de al menos 32 bytes, obligatorio. |
| `CORS_ORIGINS` | Orígenes exactos separados por comas, sin rutas. En desarrollo se admite por defecto `http://localhost:5173`; en producción ninguno si no se configura. |
| `TRUST_PROXY_HOPS` | `0` por defecto; `1` únicamente detrás de un proxy controlado como el ingreso de Render. |
| `SEED_ADMIN_EMAIL` | Opcional. Junto con `SEED_ADMIN_PASSWORD`, el seed crea o promueve la cuenta administradora con este email (normalizado a minúsculas). |
| `SEED_ADMIN_PASSWORD` | Opcional. Mismas reglas que el registro: al menos 8 caracteres y máximo 72 bytes UTF-8 (bcrypt costo 12). Debe configurarse junto con `SEED_ADMIN_EMAIL`; si solo hay una, el seed falla. |
| `SEED_ADMIN_NAME` | Opcional. Nombre visible de la cuenta administradora cuando el seed la crea; por defecto `Administrador EcoBite`. |
| `SEED_DEMO_USERS_PASSWORD` | Opcional. Si se define, el seed crea las cuentas demo del PM con esta contraseña (mínimo 8 caracteres): `cliente.demo@ecobite.test` (`CLIENTE`) y `restaurante.demo@ecobite.test` (`RESTAURANTE_ADMIN` + restaurante aprobado). |
| `EMAIL_API_KEY` | Opcional. Clave de la API de Brevo para correos transaccionales; debe configurarse junto con `EMAIL_FROM` (si solo hay una, el servidor no arranca). Sin credenciales, los correos solo se registran en el log. |
| `EMAIL_FROM` | Opcional. Remitente verificado en la cuenta de Brevo; debe configurarse junto con `EMAIL_API_KEY`. |
| `EMAIL_FROM_NAME` | Opcional. Nombre visible del remitente; por defecto `EcoBite`. |

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
Si `SEED_ADMIN_EMAIL` y `SEED_ADMIN_PASSWORD` están configuradas, el seed
además crea la cuenta `ADMIN_PLATAFORMA` o, si el email ya existe, restablece
su contraseña, rol y estado activo (es idempotente). Con
`SEED_DEMO_USERS_PASSWORD` crea además las cuentas demo
`cliente.demo@ecobite.test` (`CLIENTE`) y `restaurante.demo@ecobite.test`
(`RESTAURANTE_ADMIN`, vinculado a un restaurante aprobado en Palermo); sin la
variable se omiten. El restaurante demo se siembra inactivo: nunca aparece en
el catálogo público.

Desde la raíz: `pnpm dev:backend`. Desde `backend/`: `pnpm dev`.
El servidor valida la configuración y ejecuta `SELECT 1` antes de escuchar.
`GET /api` solo confirma que el proceso responde: para monitoreo usar
`GET /api/health`.

## Contrato HTTP

Enviar `Content-Type: application/json` en los POST. Límite del cuerpo: 16 KiB.
Las respuestas no deben almacenarse en caché. Los errores tienen el formato
`{"error":"mensaje"}` sin stack trace ni datos internos.

### Paginación

Los endpoints que devuelven colecciones sin límite propio responden un sobre
paginado uniforme:

```ts
{
  data: T[];          // filas de la página pedida
  pagination: {
    page: number;       // página devuelta (desde 1)
    limit: number;      // filas por página
    total: number;      // total de filas que cumplen el filtro
    totalPages: number; // Math.ceil(total / limit); 0 si no hay resultados
  };
}
```

Parámetros de query: `page` entero desde 1 (por defecto `1`) y `limit` entero
entre 1 y 100 (por defecto `20`). Valores inválidos (`0`, negativos, decimales
o no numéricos, `limit` mayor que 100, parámetros repetidos) responden `400`.
Una `page` fuera de rango responde `200` con `data` vacía, no un error.

Aplica a `GET /api/restaurants`, `GET /api/orders`,
`GET /api/restaurants/me/products`, `GET /api/restaurants/me/orders` y
`GET /api/admin/restaurant-requests` (que además conserva su filtro `status`).
Los catálogos acotados `GET /api/zones`, `GET /api/restaurant-categories` y
`GET /api/packagings` no se paginan: se devuelven completos.

### `GET /api/health`

Público. Ejecuta `SELECT 1` contra la base de datos con un límite de
2 segundos. Responde `200` con `{"status":"ok"}` si la base contesta a tiempo;
ante cualquier error o demora responde `503` con
`{"error":"Servicio temporalmente no disponible."}`, sin exponer detalles
internos (cadena de conexión, versión ni stack).

### `GET /api/dashboard/stats`

Protegido: `Authorization: Bearer <accessToken>` y además la cuenta debe tener
rol `ADMIN_PLATAFORMA` y estar activa. El rol se consulta en la base de datos
en cada solicitud (nunca desde el JWT), así que un token sigue válido pero
pierde el acceso apenas se degrada el rol o se desactiva la cuenta.
`401`: sesión o cuenta inválida. `403`: cualquier otro rol.

```ts
{
  totalOrders: number;    // pedidos en estado COMPLETADO
  totalRevenue: number;   // suma de monto_total de esos pedidos
  totalCo2Saved: number;  // suma de co2_ahorrado_kg de esos pedidos
}
```

Solo cuentan los pedidos `COMPLETADO`; `PENDIENTE`, `EN_PREPARACION` y
`CANCELADO` se excluyen. Hoy ningún endpoint mueve un pedido a `COMPLETADO`,
así que en producción los tres totales responden `0` hasta que exista uno.

### `GET /api/openapi.yaml` y `GET /docs`

La especificación OpenAPI 3.1 del contrato vive en `openapi.yaml` (raíz de
`backend/`) y se sirve tal cual en `/api/openapi.yaml`. Scalar la renderiza como
referencia interactiva en `/docs`. Al cambiar el contrato, actualizar el YAML:
es la documentación que consume el portal y frontend.

### `GET /api/restaurants`

Público. Devuelve el sobre paginado (ver **Paginación**) con únicamente
restaurantes activos y eco-friendly, ordenados por nombre e ID. No incluye
email ni contraseña del restaurante.

```ts
{
  data: Array<{
    id: string;
    name: string;
    category: string;
    isEco: boolean;
    zone: { id: string; name: string };
  }>;
  pagination: { page: number; limit: number; total: number; totalPages: number };
}
```

El esquema actual no tiene imágenes ni descripción comercial del restaurante.
El frontend aún espera `description`, `imageSrc` y `tag` en su tipo de tarjeta:
necesita un adaptador/ajuste de contrato en una tarea posterior. No se inventan
estos datos ni se modifica el frontend en este cambio.

### `GET /api/zones`

Público. Devuelve las zonas activas de CABA habilitadas como destino de
entrega, ordenadas por nombre e ID. `distanceKm` es la distancia promedio
estimada desde el Obelisco (seed, Haversine) y alimenta el cálculo de CO₂.

```ts
Array<{
  id: string;
  name: string;
  comuna: number;
  distanceKm: number;
}>
```

### `GET /api/restaurants/:id`

Público. Devuelve el restaurante con sus productos disponibles, ordenados por
nombre e ID. No incluye email ni contraseña del restaurante.

```ts
{
  id: string;
  name: string;
  category: string;
  isEco: boolean;
  zone: { id: string; name: string };
  products: Array<{
    id: string;
    name: string;
    category: string;
    price: number;
    available: boolean;
  }>;
}
```

- `404`: `id` que no es UUID, restaurante inexistente, inactivo o no eco
  (la misma respuesta, sin distinguir el motivo; el `id` inválido ni siquiera
  consulta la base).

### `GET /api/packagings`

Público. Devuelve el catálogo acotado de envases EcoBite (8 filas de seed,
ordenadas por nombre e ID) que un restaurante puede asignar a sus platillos;
el formulario de carga de platillos lo consume para armar `packagings`.

```ts
{
  packagings: Array<{
    id: string;
    name: string;
    traditionalMaterial: string;  // material tradicional que reemplaza
    ecoMaterial: string;          // material EcoBite del envase
    gramsPlasticAvoided: number;  // peso_base_g − peso_ecobite_g
    usualUse: string | null;
  }>;
}
```

### `POST /api/restaurants/me/products`

Protegido: `Authorization: Bearer <accessToken>` y la cuenta debe tener rol
`RESTAURANTE_ADMIN` (verificado en la base en cada solicitud, nunca desde el
JWT) con un restaurante activo vinculado; sin local asignado o con el local
inactivo también responde `403`. El `restauranteId` se toma del usuario
autenticado, nunca del cuerpo.

```json
{
  "name": "Bowl andino",
  "foodCategory": "Bowls",
  "price": 12500.00,
  "available": true,
  "packagings": [{ "packagingId": "<uuid>", "unitsPerPackage": 2 }]
}
```

- `price` positivo con máximo 2 decimales y `<= 99999999.99` (Decimal(10,2)).
- `packagings` exige al menos un envase (`packagingId` UUID, `unitsPerPackage`
  entero `>= 1` — la base lo garantiza además con un CHECK — y sin
  `packagingId` repetidos). Todos los envases deben existir en el catálogo de
  `GET /api/packagings`.
- `available` es opcional (`true` por defecto): con `false` el platillo se
  crea igualmente pero no aparece en el menú público de
  `GET /api/restaurants/:id` hasta habilitarlo.
- El platillo y sus `producto_empaque` se crean en una sola operación.
- `201`: `{"product":{...}}`. `400`: campos faltantes o adicionales, datos
  inválidos o envases inexistentes.
- `401`: sesión ausente/inválida. `403`: otro rol o restaurante no habilitado.

El producto devuelto sigue la misma forma que el menú público (`id`, `name`,
`category`, `price`, `available`) y agrega `packagings` para que el frontend
consuma una sola forma:

```ts
{
  product: {
    id: string;
    name: string;
    category: string;
    price: number;
    available: boolean;
    packagings: Array<{ id: string; name: string; unitsPerPackage: number }>;
  };
}
```

### `GET /api/restaurants/me/products`

Mismas reglas de acceso que el POST (`RESTAURANTE_ADMIN` con restaurante
activo). Devuelve el sobre paginado `{data:[...], pagination:{...}}` (ver
**Paginación**) solo con los platillos del propio restaurante, del más reciente
al más antiguo, incluyendo los de `available: false`; cada entrada trae el
`packagings` configurado.

### `GET /api/restaurants/me`

Protegido: `Authorization: Bearer <accessToken>` y rol `RESTAURANTE_ADMIN`
(verificado en la base en cada solicitud). Devuelve `{"restaurant":{...}}` con
el registro del restaurante vinculado a la cuenta, incluyendo `address` y
`email`, que el catálogo público no expone. A diferencia de los endpoints
operativos `/restaurants/me/*`, responde también con el local inactivo — el
dueño necesita ver su `active: false` — así que el `403` solo aplica a otros
roles o a una cuenta sin restaurante vinculado (o con la fila inexistente).

```ts
{
  restaurant: {
    id: string;
    name: string;
    address: string;
    email: string;
    category: string;         // etiqueta en español
    isEco: boolean;
    active: boolean;
    zone: { id: string; name: string };
    createdAt: string;
  };
}
```

### `GET /api/restaurants/me/orders`

Protegido con las mismas reglas de acceso que `/restaurants/me/products`
(`RESTAURANTE_ADMIN` con restaurante **activo**; local inactivo o ausente
responde `403`). Devuelve el sobre paginado (ver **Paginación**) con una
página de la cola del propio restaurante — todos los `pedido_estado`, sin
filtro — del más reciente al más antiguo. Incluye `customer.name` para la
entrega; nunca el email del cliente ni pedidos de otros locales. Sin pedidos
responde `{"data":[],"pagination":{...,"total":0,"totalPages":0}}`.

```ts
{
  data: Array<{
    id: string;
    status: 'PENDIENTE' | 'EN_PREPARACION' | 'COMPLETADO' | 'CANCELADO';
    createdAt: string;
    customer: { name: string };       // solo el nombre; nunca el email
    deliveryAddress: string;
    destinationZone: { id: string; name: string };
    transportType: 'BICICLETA' | 'VEHICULO_ELECTRICO';
    total: number;
    items: Array<{                    // ordenados por name e id
      productId: string;
      name: string;                   // copia histórica del nombre
      quantity: number;
      unitPrice: number;              // copia histórica del precio
      subtotal: number;
    }>;
  }>;
  pagination: { page: number; limit: number; total: number; totalPages: number };
}
```

### `POST /api/orders`

Protegido: `Authorization: Bearer <accessToken>`. Crea un pedido para el
usuario del token (cualquier rol; la cuenta debe seguir activa). El
`usuarioId` nunca se toma del cuerpo.

```json
{
  "restaurantId": "<uuid>",
  "destinationZoneId": "<uuid>",
  "deliveryAddress": "Av. Corrientes 1234",
  "transportType": "BICICLETA",
  "items": [{ "productId": "<uuid>", "quantity": 2 }]
}
```

- Se rechazan campos adicionales; los totales se calculan en el servidor con
  decimales (`Prisma.Decimal`), nunca con floats ni valores del cliente.
- `deliveryAddress`: recortada, 1–200 caracteres sin controles.
- `transportType`: `BICICLETA` o `VEHICULO_ELECTRICO`.
- `items`: 1–50 ítems sin `productId` repetido; `quantity` entera 1–99.
- Todos los productos deben pertenecer al restaurante y estar disponibles;
  la zona y el restaurante deben estar activos (y el restaurante, eco).
  Un producto sin `producto_empaque` configurado se rechaza: su impacto no
  se puede calcular y devolver cero ocultaría un dato faltante.
- El pedido nace siempre con `status` = `EN_PREPARACION`. La regla de máximo
  8 km por transporte aún no se aplica. No hay pagos ni retiro en local.
- Confirmación duplicada: las solicitudes idénticas se serializan con un
  advisory lock de transacción (PostgreSQL), así una doble confirmación
  concurrente tampoco duplica. Repetir el mismo pedido (restaurante, zona,
  dirección, transporte e ítems) dentro de 60 s devuelve el existente con
  `200` en vez de crear otro.
- `201`: `{"order":{...}}`; `200`: pedido duplicado existente.
- `400`: datos inválidos, zona inactiva, productos no disponibles o productos
  sin empaque configurado.
- `401`: sesión ausente/inválida o cuenta inactiva. `404`: restaurante no
  encontrado. `413`/`415`: límites de cuerpo y media type.

Respuesta (`Order`):

```ts
{
  id: string;
  status: 'EN_PREPARACION' | 'PENDIENTE' | 'COMPLETADO' | 'CANCELADO';
  createdAt: string;
  restaurant: { id: string; name: string };
  destinationZone: { id: string; name: string };
  deliveryAddress: string;
  transportType: 'BICICLETA' | 'VEHICULO_ELECTRICO';
  total: number;
  impact: {
    distanceKm: number;      // copia de distancia_promedio_km de la zona
    co2SavedKg: number;      // distanceKm × 0.08, 3 decimales
    containersAvoided: number;
    plasticAvoidedG: number;
  };
  items: Array<{             // ordenados por name e id, no por el orden enviado
    productId: string;
    name: string;            // copia histórica del nombre
    quantity: number;
    unitPrice: number;       // copia histórica del precio
    subtotal: number;
    containersAvoided: number;
    plasticAvoidedG: number;
  }>;
}
```

### `GET /api/orders`

Protegido. Devuelve el sobre paginado (ver **Paginación**) con una página de
los pedidos del usuario autenticado, del más reciente al más antiguo. La
cuenta se consulta en cada llamada: desactivarla invalida el acceso de
inmediato. `200`: `{data: Order[], pagination: {...}}`. `401`: sesión o cuenta
inválida.

### `GET /api/orders/:id`

Protegido. Devuelve `{"order": Order}` solo si el pedido pertenece al usuario
del token. `404`: `id` que no es UUID (sin consulta a la base), pedido
inexistente o de otro usuario — la misma respuesta para no revelar pedidos
ajenos. `401`: sesión o cuenta inválida.

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

### `GET /api/users/me/impact`

Protegido: `Authorization: Bearer <accessToken>` (cualquier rol; la cuenta debe
seguir activa). Devuelve el impacto acumulado del propio usuario: el
`usuarioId` sale del token, nunca de parámetros.

```ts
{
  impact: {
    totalCo2SavedKg: number;        // suma de co2_ahorrado_kg
    totalContainersAvoided: number; // suma de total_envases_evitados
    totalOrders: number;            // cantidad de pedidos COMPLETADO
  };
}
```

Solo cuentan los pedidos `COMPLETADO` (la misma regla que
`GET /api/dashboard/stats`); `PENDIENTE`, `EN_PREPARACION` y `CANCELADO` se
excluyen. Sin pedidos completados, los tres totales responden `0`.
`401`: token ausente, inválido, vencido o usuario eliminado/inactivo.

### `GET /api/restaurant-categories`

Público. Devuelve las cuatro categorías admitidas para restaurantes aliados;
es la fuente de verdad de los valores que acepta `category` en
`POST /api/restaurant-requests`. Cada entrada trae el `key` del enum y su
`label` en español.

```ts
{ categories: Array<{ key: string; label: string }> }
```

### `POST /api/restaurant-requests`

Protegido: `Authorization: Bearer <accessToken>` y la cuenta debe tener rol
`CLIENTE` y estar activa (el rol se verifica en la base en cada solicitud).
Crea una solicitud de alta para el usuario del token.

```json
{
  "name": "Verde Bistró",
  "category": "COMIDA_SALUDABLE",
  "zoneId": "uuid",
  "address": "Av. Santa Fe 1234",
  "email": "contacto@verdebistro.test",
  "commitmentAccepted": true
}
```

- `201`: `{"request":{...}}` con `status` `PENDIENTE` y la aceptación del
  compromiso registrada con la fecha del servidor.
- `400`: campos faltantes o adicionales, `category` inválida, `zoneId` no UUID,
  `commitmentAccepted` distinto de `true`, o zona inexistente/inactiva.
- `401`/`403`: sesión inválida o rol distinto de `CLIENTE`.
- `409`: ya existe una solicitud `PENDIENTE`/`APROBADA` del usuario, o el email
  pertenece a otro restaurante o solicitud. Un rechazo no bloquea: se puede
  volver a aplicar con otro email.

### `GET /api/restaurant-requests/me`

Protegido (cualquier rol; la cuenta debe seguir activa). Devuelve
`{"request":{...}}` con la solicitud más reciente del usuario o
`{"request":null}` si nunca aplicó. Es la vía por la que un
`RESTAURANTE_ADMIN` recién aprobado ve el estado `APROBADA` en la aplicación.

### `GET /api/admin/restaurant-requests?status=`

Solo `ADMIN_PLATAFORMA` (rol verificado en la base en cada llamada).
`status` admite `PENDIENTE` (por defecto), `APROBADA`, `RECHAZADA` y `TODAS`
(sin filtro) y se combina con `page`/`limit`. Devuelve el sobre paginado
`{data:[...], pagination:{...}}` (ver **Paginación**) de más antigua a más
reciente; `total` cuenta solo las filas del estado pedido y cada entrada
incluye `applicant` y `reviewedBy`. `400` si `status` no es un único valor
válido o si `page`/`limit` son inválidos.

### `GET /api/admin/restaurant-requests/:id`

Solo `ADMIN_PLATAFORMA`. Detalle completo de la solicitud. `404` tanto para un
`id` inexistente como para uno que no es UUID.

### `POST /api/admin/restaurant-requests/:id/approve`

Solo `ADMIN_PLATAFORMA`. El cuerpo debe estar vacío (`{}` o ausente; `400` si
trae campos). En una sola transacción: marca la solicitud `APROBADA` con fecha
y revisor, crea el restaurante (activo y eco) con los datos de la solicitud y
promueve al solicitante a `RESTAURANTE_ADMIN` asignándole el restaurante.
`404` si no existe; `409` si ya fue revisada, si el solicitante está inactivo
o cambió de rol, o si ya existe un restaurante con ese email.

Aprobar también dispara un correo transaccional al email de la solicitud
(Brevo si `EMAIL_API_KEY`/`EMAIL_FROM` están configuradas; si no, solo se
registra en el log). El envío es asincrónico: la respuesta nunca espera ni
depende del proveedor, y un fallo del envío no revierte la aprobación.

### `POST /api/admin/restaurant-requests/:id/reject`

Solo `ADMIN_PLATAFORMA`. Misma forma que approve — cuerpo vacío — pero no crea
restaurante ni cambia roles, y no registra motivo. `409` si ya fue revisada.

## Límites operativos

- Registro y login comparten 20 intentos por IP cada 15 minutos (`429` con
  `Retry-After`). El store es en memoria por proceso, lo cual es correcto porque
  Render hoy ejecuta una sola instancia de `ecobite-api` (`render.yaml`): los
  contadores se reinician con el proceso y no se comparten entre réplicas. Si se
  agrega una segunda instancia hace falta un store compartido (p. ej. Redis);
  el issue #39 sigue ese trabajo pendiente.
- Express no confía automáticamente en `X-Forwarded-For`. Tras un proxy,
  configurar `TRUST_PROXY_HOPS=1` solo para un salto controlado; no usar `true` indiscriminadamente.
  Sin configuración, usuarios tras ese proxy podrían compartir un límite.
- CORS limita qué orígenes de navegador pueden leer respuestas; **no reemplaza
  autenticación** ni bloquea clientes como curl.
- El registro revela duplicados con `409`; el login no distingue si el email existe.
  Revisar esa política si el servicio se abre públicamente.
- Los listados usan paginación por `page`/`limit` (offset) con `limit` máximo
  100; ver **Paginación**. Una `page` fuera de rango responde `data` vacía. Si el
  volumen crece mucho, evaluar cursor en una versión posterior.
- Algunos errores de conexión/timeout de Prisma responden `503`. Otros errores
  inesperados responden `500`, sin filtrar mensajes internos.
- Los emails existentes importados por otro mecanismo deben respetar la
  normalización a minúsculas. Este cambio no modifica datos existentes.

## Apagado ordenado

El servidor escucha `SIGTERM` y `SIGINT` (Ctrl+C) y cierra de forma ordenada:
deja de aceptar conexiones nuevas, drena las solicitudes en curso, cierra las
conexiones keep-alive inactivas y desconecta Prisma antes de salir con código
`0`. Si el drenado supera los 10 segundos, cierra las conexiones restantes a la
fuerza y sale con código `1`.

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

## Importación del dataset S3

El handoff de Rebeca del 15/10/2026 usa `CLIENTE`, `ADMIN_PLATAFORMA` y
`RESTAURANTE_ADMIN`, y cuatro estados: `PENDIENTE`, `EN_PREPARACION`,
`COMPLETADO`, `CANCELADO`. La migración `20261015223000_align_s3_enums` renombra
`ADMIN` conservando las cuentas existentes y agrega los nuevos valores.
No agrega permisos, rutas administrativas ni registro público de otros roles.

Copiar las ocho exportaciones CSV a `backend/prisma/data/` (gitignored), con
nombres como `Usuarios.csv` o `Dataset_Ecobite_integrado.xlsx - Usuarios.csv`.
`ANALYST_DATA_DIR` permite elegir otra carpeta. No subir estos archivos a git.

Desde la raíz:

```sh
pnpm --filter backend prisma:generate
pnpm --filter backend data:import -- --dry-run
```

Este es también el comportamiento por defecto sin argumentos: valida formatos,
las diez relaciones, unicidad y fórmulas de montos/impacto sin conectarse a la DB.
El import excluye únicamente usuarios `REPARTIDOR` por decisión aprobada del MVP;
si algún pedido los referencia, aborta en lugar de perder ese pedido.
El dataset entregado conserva **806 usuarios, 1 restaurante, 40 productos,
800 pedidos, 1603 detalles y 44 relaciones producto/empaque**; excluye 94 cuentas.
Los CSV originales no se modifican.

Para escribir, primero elegir explícitamente una DB aislada, aplicar migraciones
y ejecutar el seed de referencia. Luego usar `data:import -- --apply`.
No ejecutar contra Neon sin aprobación del destino y del import.
La operación resuelve zonas/empaques por nombre contra el seed y verifica sus
distancias/gramos. Inserta las otras seis tablas en una sola transacción:
cualquier fallo revierte todo el import. Los IDs UUID son deterministas por
entidad/código; repetir no duplica ni sobrescribe filas ya existentes. No es
un sincronizador: cambios posteriores del CSV no actualizan IDs ya importados.
Conflictos de email con otros IDs abortan, no fusionan cuentas.

Se preservan los hashes originales (los SHA-256 simulados no sirven para login
bcrypt; registrar una cuenta nueva para probar auth). Se conservan las fechas de
creación/edición, incluso fechas futuras documentadas, interpretando los DATETIME
sin zona del CSV como UTC. Solo `COMPLETADO` suma a los KPIs; se permiten los
20 cancelados sin detalle documentados. Los códigos originales no son los UUID
expuestos por la API; usar la misma traducción si se integra `order_id` de GA4.

`pnpm --filter backend check:api` incluye los tests del import sin DB. Para
ejecutar el test PostgreSQL opcional, configurar `IMPORT_TEST_DATABASE_URL` y
`DATABASE_URL` iguales apuntando a una **DB nueva y desechable**, local, cuyo
nombre empiece por `ecobite_import_check_`, con migraciones y seed aplicados.
No usar una base con datos propios: el test crea sus propios registros.

Despliegue: coordinar el rename de `ADMIN` con los consumidores de `role`;
no hacer rollback a un cliente Prisma generado con el enum viejo tras migrar.
Revertir código no revierte el enum ni borra datos importados. Cualquier
downgrade o limpieza de datos necesita un procedimiento y aprobación aparte.

## Deploy y presentación

Ver [setup de Render, Neon, Vercel y backups](../docs/deployment.md) y la
[guía de pruebas con URL real y Scalar](../docs/demo-api.md). El comando
`pnpm prisma:deploy` aplica migraciones pendientes sin resetear ni ejecutar seed.
