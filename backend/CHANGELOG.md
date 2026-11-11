# Changelog

Todos los cambios relevantes de la API de EcoBite se documentan en este archivo.
El portal (`api-portal`, página **Novedades**) lo lee al momento del build, así que es
la única fuente de verdad del historial de versiones.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y las
versiones siguen [Semantic Versioning](https://semver.org/lang/es/). La versión
publicada coincide con `info.version` de `backend/openapi.yaml`.

Reglas del archivo:

- Secciones admitidas por versión: `Added`, `Changed`, `Deprecated`, `Removed`,
  `Fixed` y `Security`.
  Reservar `Security` para cambios de seguridad reales.
- Las fechas usan `AAAA-MM-DD`. El trabajo pendiente va bajo `Unreleased`, sin fecha.
- Un párrafo de texto libre entre el encabezado de versión y la primera sección se
  muestra como introducción de esa versión; usarlo solo cuando un cambio importante
  merece contexto.
- Los enlaces de comparación (`[1.0.0]: url`) y de release (`[1.0.0 release]: url`)
  se agregan al final solo cuando existen el tag o la GitHub Release correspondientes.
- Referenciar issues con enlaces explícitos, por ejemplo
  `[Issue #27](https://github.com/Talently-Lab/s2602-EcoBite/issues/27)`.
- Una entrada por cambio, en una sola línea y como máximo dos oraciones
  cortas, escrita para quien consume la API: qué puede hacer o qué debe
  hacer distinto. Regla de corte: si el detalle no hace falta para llamar
  al endpoint correctamente, no va.
- El mecanismo interno (transacciones, consultas, proveedores, tiempos) no
  se cuenta: el contrato detallado vive en `openapi.yaml`, la operación en
  `README.md` y la implementación en el PR. Una variable de entorno que el
  operador deba configurar sí se nombra, en la misma línea.
- Las actualizaciones de dependencias solo se listan si corrigen una
  vulnerabilidad, rompen compatibilidad o exigen una acción. Las de toolchain
  que no llegan a producción se agrupan en una sola entrada.
- En `Security`, nombrar el paquete, la versión corregida y el tipo de falla,
  enlazando el advisory (CVE/GHSA) cuando exista.

## [Unreleased]

### Added

- `GET /restaurant-categories` (público): lista las categorías de
  restaurantes aliados con su etiqueta en español.
  [Issue #41](https://github.com/Talently-Lab/s2602-EcoBite/issues/41)
- `POST /restaurant-requests` (rol `CLIENTE`): solicita el alta de un
  restaurante aliado. Si es rechazada se puede volver a aplicar.
  [Issue #41](https://github.com/Talently-Lab/s2602-EcoBite/issues/41)
- `GET /restaurant-requests/me`: devuelve la última solicitud propia, o
  `null` si nunca aplicó.
  [Issue #41](https://github.com/Talently-Lab/s2602-EcoBite/issues/41)
- `GET /admin/restaurant-requests` y `GET /admin/restaurant-requests/{id}`
  (rol `ADMIN_PLATAFORMA`): listado filtrable por estado y detalle de cada
  solicitud.
  [Issue #41](https://github.com/Talently-Lab/s2602-EcoBite/issues/41)
- `POST /admin/restaurant-requests/{id}/approve` y
  `POST /admin/restaurant-requests/{id}/reject` (rol `ADMIN_PLATAFORMA`):
  aprueban o rechazan una solicitud. La aprobación crea el restaurante y
  promueve al solicitante a `RESTAURANTE_ADMIN`; ambas responden `409` si
  ya fue revisada.
  [Issue #41](https://github.com/Talently-Lab/s2602-EcoBite/issues/41)
- `POST /admin/restaurant-requests/{id}/approve` envía un correo de
  confirmación al solicitante. Requiere `EMAIL_API_KEY` y `EMAIL_FROM`;
  sin credenciales solo queda registrado en el log.
  [Issue #54](https://github.com/Talently-Lab/s2602-EcoBite/issues/54)
- `GET /users/me/impact` (autenticado): totales de impacto propios (CO₂
  ahorrado, envases evitados y pedidos) contando solo pedidos `COMPLETADO`.
  [Issue #35](https://github.com/Talently-Lab/s2602-EcoBite/issues/35)
- `GET /packagings` (público): catálogo de los envases EcoBite con el
  material eco y los gramos de plástico evitados por envase.
  [Issue #55](https://github.com/Talently-Lab/s2602-EcoBite/issues/55)
- `POST /restaurants/me/products` y `GET /restaurants/me/products` (rol
  `RESTAURANTE_ADMIN` con restaurante activo): crea y lista los platillos
  propios. Un platillo con `available: true` aparece de inmediato en el
  catálogo público.
  [Issue #55](https://github.com/Talently-Lab/s2602-EcoBite/issues/55)
- `GET /restaurants/me` (rol `RESTAURANTE_ADMIN`): datos del propio
  restaurante, incluido el estado `active`. Responde aunque el local esté
  inactivo.
  [Issue #56](https://github.com/Talently-Lab/s2602-EcoBite/issues/56)
- `GET /restaurants/me/orders` (rol `RESTAURANTE_ADMIN` con restaurante
  activo): pedidos recibidos del propio local, más recientes primero, con
  el nombre del cliente para la entrega.
  [Issue #56](https://github.com/Talently-Lab/s2602-EcoBite/issues/56)

## [1.2.0] - 2026-11-06

Esta versión suma la base del flujo de restaurantes aliados (solicitudes con
estados y categorías), cuentas demo para la verificación del equipo, vistas de
analítica de solo lectura sin PII y el apagado ordenado del servidor, además del
health check y las estadísticas del admin.

### Added

- `GET /health`: chequeo público de salud que ejecuta `SELECT 1` con un límite
  de 2 segundos; ante cualquier error o demora responde `503` sin exponer
  detalles internos.
  [Issue #34](https://github.com/Talently-Lab/s2602-EcoBite/issues/34)
- `GET /dashboard/stats` (solo `ADMIN_PLATAFORMA`): totales globales de pedidos
  en estado `COMPLETADO` (cantidad, ingresos y CO₂ ahorrado).
  [Issue #32](https://github.com/Talently-Lab/s2602-EcoBite/issues/32)
- El seed crea la cuenta administradora cuando `SEED_ADMIN_EMAIL` y
  `SEED_ADMIN_PASSWORD` están configuradas (nombre opcional con
  `SEED_ADMIN_NAME`).
  [Issue #32](https://github.com/Talently-Lab/s2602-EcoBite/issues/32)
- Esquema `analytics` de solo lectura: vistas para el equipo de Datos que
  excluyen `password_hash` y la PII de los solicitantes (email y dirección),
  accesibles mediante el rol restringido `analista_datos`.
  [Issue #47](https://github.com/Talently-Lab/s2602-EcoBite/issues/47)
- Cuentas demo de verificación (cliente y administrador de restaurante con su
  solicitud `APROBADA`) cuando `SEED_DEMO_USERS_PASSWORD` está configurada; el
  restaurante demo queda inactivo y nunca aparece en el catálogo.
  [Issue #41](https://github.com/Talently-Lab/s2602-EcoBite/issues/41)
- Apagado ordenado: ante `SIGTERM`/`SIGINT` el servidor deja de aceptar
  conexiones, drena las solicitudes en curso, cierra las keep-alive inactivas
  y desconecta Prisma; si el drenado supera 10 segundos fuerza la salida.
  [Issue #37](https://github.com/Talently-Lab/s2602-EcoBite/issues/37)

### Changed

- `GET /restaurants` y `GET /restaurants/{id}`: `category` ya no admite `null`
  y siempre devuelve una de las cuatro etiquetas (`Comida saludable`,
  `Comida de estación`, `Comida vegana`, `Comida casera`).
  [Issue #41](https://github.com/Talently-Lab/s2602-EcoBite/issues/41)

### Security

- El rol administrativo nunca se lee del JWT: `GET /dashboard/stats` consulta
  `activo` y `rol` en la base en cada solicitud, así que un token sigue válido
  pero pierde el acceso apenas se degrada el rol o se desactiva la cuenta.
  [Issue #32](https://github.com/Talently-Lab/s2602-EcoBite/issues/32)
- La columna `restaurantes.password_hash` se eliminó de la base: los
  administradores de restaurante se autentican con su cuenta `usuario`, como el
  resto de los roles; ya no existe una credencial separada por restaurante.
  [Issue #41](https://github.com/Talently-Lab/s2602-EcoBite/issues/41)
- Al ejecutarse con credenciales configuradas, el seed reemplaza también la
  contraseña, el rol y el estado de la cuenta administradora: un registro
  previo con ese email no conserva su propia contraseña al ser promovido.
  [Issue #32](https://github.com/Talently-Lab/s2602-EcoBite/issues/32)

## [1.1.0] - 2026-10-23

Esta versión introduce los pedidos de delivery sustentable: el cliente arma su
pedido y el servidor calcula el total, los envases y el plástico evitados, la
distancia estimada y el CO₂ ahorrado.
[Issue #27](https://github.com/Talently-Lab/s2602-EcoBite/issues/27)

### Added

- `GET /restaurants/{id}`: detalle público de un restaurante activo y eco-friendly
  con sus productos disponibles.
- `GET /zones`: zonas de entrega activas.
- `POST /orders` (autenticado): crea un pedido en estado `EN_PREPARACION`. Valida
  identificadores, dirección, tipo de transporte, cantidades, productos repetidos,
  pertenencia de los productos al restaurante, disponibilidad y zona activa. Los
  productos sin empaque configurado responden `400` en lugar de registrar un
  impacto ambiental de cero.
- `GET /orders` y `GET /orders/{id}` (autenticados): historial y detalle de los
  pedidos del usuario. Los pedidos ajenos o inexistentes responden el mismo `404`.
- Protección contra confirmaciones duplicadas: repetir el mismo pedido, incluso en
  solicitudes simultáneas, devuelve `200` con el pedido existente en lugar de crear
  otro.
- Esquemas `RestaurantRef`, `RestaurantDetail`, `Zone`, `Order` y `OrderItem` en la
  referencia OpenAPI, que pasa a `info.version` 1.1.0.

### Changed

- Referencia OpenAPI: las colecciones muestran nombre en español (`x-displayName`) y
  el encabezado `X-Content-Type-Options` queda documentado en las respuestas.

### Security

- `express` 5.3.0 con `body-parser` 2.4.0: corrige un DoS por bytes finales tras
  un cuerpo comprimido
  ([GHSA-27r3-jxmh-p828](https://github.com/advisories/GHSA-27r3-jxmh-p828)).
- `next` 16.4.3 (portal): corrige dos RCE no autenticados y un DoS en Server
  Actions
  ([GHSA-2464-fhr4-w9xw](https://github.com/advisories/GHSA-2464-fhr4-w9xw),
  [GHSA-673q-mjm6-r5xr](https://github.com/advisories/GHSA-673q-mjm6-r5xr),
  [GHSA-p3m5-59mp-jv5r](https://github.com/advisories/GHSA-p3m5-59mp-jv5r)).
- Toolchain de desarrollo (`vite` 8.3.5, `shadcn` 4.22.1, SDK de MCP 1.32.2,
  `undici` 7.30.1, `ip-address` 10.7.5, `fast-uri` 3.1.9, `hono` 4.13.14,
  `zod` 4.6.7): resuelve el resto de los avisos de `pnpm audit`
  (24 vulnerabilidades en total); sin cambios en el contrato de la API.

## [1.0.0] - 2026-10-15

### Added

- `POST /users/register`: registro de clientes con rol `CLIENTE`.
  [Issue #5](https://github.com/Talently-Lab/s2602-EcoBite/issues/5)
- `POST /users/login`: emite un `accessToken` JWT HS256 con una hora de duración
  para los endpoints protegidos.
  [Issue #5](https://github.com/Talently-Lab/s2602-EcoBite/issues/5)
- `GET /users/me` (autenticado): perfil del cliente sin datos sensibles.
  [Issue #5](https://github.com/Talently-Lab/s2602-EcoBite/issues/5)
- `GET /restaurants`: lista de restaurantes activos y eco-friendly.
  [Issue #5](https://github.com/Talently-Lab/s2602-EcoBite/issues/5)
- Referencia OpenAPI 3.1 publicada en `/api/openapi.yaml` y renderizada con Scalar
  en `/docs`. [Issue #5](https://github.com/Talently-Lab/s2602-EcoBite/issues/5)

### Security

- Registro e inicio de sesión comparten un límite de 20 intentos por IP cada
  15 minutos; al agotarse responden `429` con el encabezado `Retry-After`.
- Todas las respuestas incluyen `Cache-Control: no-store` y
  `X-Content-Type-Options: nosniff`. Los `POST` exigen
  `Content-Type: application/json` (`415` si no coincide) y el cuerpo se limita a
  16 KiB (`413` si se excede).

[1.2.0]: https://github.com/Talently-Lab/s2602-EcoBite/compare/1cbcffe...HEAD
[1.1.0]: https://github.com/Talently-Lab/s2602-EcoBite/compare/fd39d6c...1cbcffe
[1.0.0]: https://github.com/Talently-Lab/s2602-EcoBite/compare/7c458ba...fd39d6c
