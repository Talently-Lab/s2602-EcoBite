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
  `([Issue #27](https://github.com/Talently-Lab/s2602-EcoBite/issues/27))`.
- Una entrada por cambio, en una sola línea y escrita desde la perspectiva del
  lector; el detalle de implementación va en el commit o el PR.
- Las actualizaciones de dependencias solo se listan si corrigen una
  vulnerabilidad, rompen compatibilidad o exigen una acción. Las de toolchain
  que no llegan a producción se agrupan en una sola entrada.
- En `Security`, nombrar el paquete, la versión corregida y el tipo de falla,
  enlazando el advisory (CVE/GHSA) cuando exista.

## [Unreleased]

### Added

- `GET /restaurant-categories` (público): las cuatro categorías admitidas para
  restaurantes aliados con su etiqueta en español; es la fuente de verdad de
  los valores que acepta `category` en `POST /restaurant-requests`.
  ([Issue #41](https://github.com/Talently-Lab/s2602-EcoBite/issues/41))
- `POST /restaurant-requests` (rol `CLIENTE`): solicitud de alta de restaurante
  con categoría, zona activa, aceptación del compromiso y email único; una sola
  solicitud pendiente o aprobada por usuario, y un rechazo permite volver a
  aplicar con otro email.
  ([Issue #41](https://github.com/Talently-Lab/s2602-EcoBite/issues/41))
- `GET /restaurant-requests/me`: última solicitud del usuario autenticado,
  cualquiera sea su rol, o `null` si nunca aplicó; es el aviso en la aplicación
  de la aprobación.
  ([Issue #41](https://github.com/Talently-Lab/s2602-EcoBite/issues/41))
- `GET /admin/restaurant-requests` y `GET /admin/restaurant-requests/{id}`
  (rol `ADMIN_PLATAFORMA`): listado filtrable por estado y detalle de cada
  solicitud con el solicitante y el revisor.
  ([Issue #41](https://github.com/Talently-Lab/s2602-EcoBite/issues/41))
- `POST /admin/restaurant-requests/{id}/approve` y
  `POST /admin/restaurant-requests/{id}/reject` (rol `ADMIN_PLATAFORMA`): la
  aprobación crea el restaurante activo y eco y promueve al solicitante a
  `RESTAURANTE_ADMIN` en una sola transacción; el rechazo solo cambia el
  estado. La actualización condicional responde `409` si la solicitud ya fue
  revisada.
  ([Issue #41](https://github.com/Talently-Lab/s2602-EcoBite/issues/41))

## [1.2.0] - 2026-11-06

Esta versión suma la base del flujo de restaurantes aliados (solicitudes con
estados y categorías), cuentas demo para la verificación del equipo, vistas de
analítica de solo lectura sin PII y el apagado ordenado del servidor, además del
health check y las estadísticas del admin.

### Added

- `GET /health`: chequeo público de salud que ejecuta `SELECT 1` con un límite
  de 2 segundos; ante cualquier error o demora responde `503` sin exponer
  detalles internos.
  ([Issue #34](https://github.com/Talently-Lab/s2602-EcoBite/issues/34))
- `GET /dashboard/stats` (solo `ADMIN_PLATAFORMA`): totales globales de pedidos
  en estado `COMPLETADO` (cantidad, ingresos y CO₂ ahorrado).
  ([Issue #32](https://github.com/Talently-Lab/s2602-EcoBite/issues/32))
- El seed crea la cuenta administradora cuando `SEED_ADMIN_EMAIL` y
  `SEED_ADMIN_PASSWORD` están configuradas (nombre opcional con
  `SEED_ADMIN_NAME`).
  ([Issue #32](https://github.com/Talently-Lab/s2602-EcoBite/issues/32))
- Esquema `analytics` de solo lectura: vistas para el equipo de Datos que
  excluyen `password_hash` y la PII de los solicitantes (email y dirección),
  accesibles mediante el rol restringido `analista_datos`.
  ([Issue #47](https://github.com/Talently-Lab/s2602-EcoBite/issues/47))
- Cuentas demo de verificación (cliente y administrador de restaurante con su
  solicitud `APROBADA`) cuando `SEED_DEMO_USERS_PASSWORD` está configurada; el
  restaurante demo queda inactivo y nunca aparece en el catálogo.
  ([Issue #41](https://github.com/Talently-Lab/s2602-EcoBite/issues/41))
- Apagado ordenado: ante `SIGTERM`/`SIGINT` el servidor deja de aceptar
  conexiones, drena las solicitudes en curso, cierra las keep-alive inactivas
  y desconecta Prisma; si el drenado supera 10 segundos fuerza la salida.
  ([Issue #37](https://github.com/Talently-Lab/s2602-EcoBite/issues/37))

### Changed

- `GET /restaurants` y `GET /restaurants/{id}`: `category` ya no admite `null`
  y siempre devuelve una de las cuatro etiquetas (`Comida saludable`,
  `Comida de estación`, `Comida vegana`, `Comida casera`).
  ([Issue #41](https://github.com/Talently-Lab/s2602-EcoBite/issues/41))

### Security

- El rol administrativo nunca se lee del JWT: `GET /dashboard/stats` consulta
  `activo` y `rol` en la base en cada solicitud, así que un token sigue válido
  pero pierde el acceso apenas se degrada el rol o se desactiva la cuenta.
  ([Issue #32](https://github.com/Talently-Lab/s2602-EcoBite/issues/32))
- La columna `restaurantes.password_hash` se eliminó de la base: los
  administradores de restaurante se autentican con su cuenta `usuario`, como el
  resto de los roles; ya no existe una credencial separada por restaurante.
  ([Issue #41](https://github.com/Talently-Lab/s2602-EcoBite/issues/41))
- Al ejecutarse con credenciales configuradas, el seed reemplaza también la
  contraseña, el rol y el estado de la cuenta administradora: un registro
  previo con ese email no conserva su propia contraseña al ser promovido.
  ([Issue #32](https://github.com/Talently-Lab/s2602-EcoBite/issues/32))

## [1.1.0] - 2026-10-23

Esta versión introduce los pedidos de delivery sustentable: el cliente arma su
pedido y el servidor calcula el total, los envases y el plástico evitados, la
distancia estimada y el CO₂ ahorrado.
([Issue #27](https://github.com/Talently-Lab/s2602-EcoBite/issues/27))

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
  ([Issue #5](https://github.com/Talently-Lab/s2602-EcoBite/issues/5))
- `POST /users/login`: emite un `accessToken` JWT HS256 con una hora de duración
  para los endpoints protegidos.
  ([Issue #5](https://github.com/Talently-Lab/s2602-EcoBite/issues/5))
- `GET /users/me` (autenticado): perfil del cliente sin datos sensibles.
  ([Issue #5](https://github.com/Talently-Lab/s2602-EcoBite/issues/5))
- `GET /restaurants`: lista de restaurantes activos y eco-friendly.
  ([Issue #5](https://github.com/Talently-Lab/s2602-EcoBite/issues/5))
- Referencia OpenAPI 3.1 publicada en `/api/openapi.yaml` y renderizada con Scalar
  en `/docs`. ([Issue #5](https://github.com/Talently-Lab/s2602-EcoBite/issues/5))

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
