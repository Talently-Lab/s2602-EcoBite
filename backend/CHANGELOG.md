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

[1.1.0]: https://github.com/Talently-Lab/s2602-EcoBite/compare/fd39d6c...HEAD
[1.0.0]: https://github.com/Talently-Lab/s2602-EcoBite/compare/7c458ba...fd39d6c
