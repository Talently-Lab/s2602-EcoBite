<!-- Los títulos de PR son concisos y legibles. No usar prefijo de Conventional
     Commits tipo chore(scope): salvo que el equipo lo requiera explícitamente. -->

## Issue

<!-- Linkear el issue que cierra este PR. Esto lo cierra automáticamente al
     hacer merge a la rama por defecto. Verificar Done en el tablero;
     usar Refs #NN si este PR no completa todo el issue. -->
Closes #

## Qué

<!-- Qué cambia este PR. Ser concreto. Si es refactor, aclarar que preserva
     el comportamiento. -->

## Por qué

<!-- El problema o motivación. Linkear la tarjeta del tablero, el sprint
     o el DER si aplica. -->

## Alcance / Fuera de alcance

<!-- Qué este PR NO toca deliberadamente: frontend, rutas de otro integrante,
     tablas del DER, middleware. Si es refactor o chore, declarar acá la
     garantía de que preserva el comportamiento. -->

## Impacto

<!-- ¿Cambia algo visible para el frontend u otro integrante? Si cambia el
     contrato de una API o el esquema de datos, avisar al equipo antes del
     merge. Cambios internos/docs: indicar que no hay impacto. -->

- Release de API: sin cambio / patch / minor / major (justificar).
- Si el release está aprobado: alinear `backend/package.json`, `backend/openapi.yaml` y `backend/CHANGELOG.md` (el portal lo consume al build).
- Tooling/docs/interno o portal sin cambio de API: sin bump de API. No sincronizar versiones de todo el monorepo ni publicar tags/releases sin aprobación.

## Verificación (gates locales - todo en verde)

- `pnpm --filter backend lint`
- `pnpm --filter backend build`
- `pnpm --filter backend typecheck`
- `pnpm --filter backend check:api` (dobles de Prisma, no PostgreSQL real)
- Si toca `api-portal/`: `pnpm --filter api-portal lint`, `pnpm --filter api-portal typecheck`, `pnpm --filter api-portal build`.
- Solo docs/plantillas: `git diff --check` y referencias/YAML; indicar qué gates de aplicación se omiten y por qué.
- Si toca datos/esquema: evidencia en PostgreSQL aislado autorizado; no ejecutar seed/migraciones/importaciones contra producción como verificación.
- Seleccionar gates por componente; frontend se coordina con su responsable.

## Checks antes de merge

<!-- Los workflows actuales siempre reportan checks de backend y portal en PRs a main.
     No afirmar que protegen frontend ni que prueban PostgreSQL real. -->
- Backend checks (audit → lint → build → typecheck → API tests)
- API Portal checks (audit → lint → typecheck → build)
- Revisión de al menos un integrante del equipo

## Rollback

<!-- Cómo revertir y por qué es seguro (ej.: revert de un commit, docs-only,
     sin impacto en datos/migraciones). Si incluye una migración, explicar
     cómo revertirla o por qué no hace falta. -->

## Etiquetas

<!-- Aplicar al menos una etiqueta de categoría de las existentes. -->
- Categoría: `enhancement` / `bug` / `documentation` / `tooling` / `ops` / `data`
- Sprint: `sprint-N` solo con compromiso aprobado; sin etiqueta si sigue en backlog

## Flujo del tablero

<!-- El PR no crea una tarjeta nueva. La tarjeta del issue es la única fuente
     de verdad; este PR se linkea vía Closes #NN. Las PR de Dependabot son
     la excepción aprobada: conservan su propia tarjeta sin issue duplicado. -->
- Tablero backend: https://github.com/orgs/Talently-Lab/projects/1
- Issue backend/API portal asignado a NaferJ, con categoría y Priority.
- Mover la tarjeta del issue a "In Review" al abrir el PR; preparar el texto no abre el PR.
- Al mergear, verificar cierre y "Done"; no asumir que la automatización está configurada.
