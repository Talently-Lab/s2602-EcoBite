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

### `GET /api/openapi.yaml` y `GET /docs`

La especificación OpenAPI 3.1 del contrato vive en `openapi.yaml` (raíz de
`backend/`) y se sirve tal cual en `/api/openapi.yaml`. Scalar la renderiza como
referencia interactiva en `/docs`. Al cambiar el contrato, actualizar el YAML:
es la documentación que consume el portal y frontend.

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
  category: string | null;
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

Protegido. Lista solo los pedidos del usuario autenticado, del más reciente
al más antiguo. La cuenta se consulta en cada llamada: desactivarla invalida
el acceso de inmediato. `200`: `{"orders": Order[]}`. `401`: sesión o cuenta
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

## Límites operativos

- Registro y login comparten 20 intentos por IP cada 15 minutos (`429` con
  `Retry-After`). El store es en memoria: se reinicia con el proceso y no comparte
  contadores entre réplicas. Usar un store compartido antes de escalar.
- Express no confía automáticamente en `X-Forwarded-For`. Tras un proxy,
  configurar `TRUST_PROXY_HOPS=1` solo para un salto controlado; no usar `true` indiscriminadamente.
  Sin configuración, usuarios tras ese proxy podrían compartir un límite.
- CORS limita qué orígenes de navegador pueden leer respuestas; **no reemplaza
  autenticación** ni bloquea clientes como curl.
- El registro revela duplicados con `409`; el login no distingue si el email existe.
  Revisar esa política si el servicio se abre públicamente.
- No hay paginación todavía: el alcance inicial del dataset tiene un restaurante.
  `GET /api/orders` también devuelve el historial completo del usuario; si el
  volumen crece, evaluar `limit`/cursor en una versión posterior.
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
