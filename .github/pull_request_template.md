<!-- Los títulos de PR son concisos y legibles. No usar prefijo de Conventional
     Commits tipo chore(scope): salvo que el equipo lo requiera explícitamente. -->

## Issue

<!-- Linkear el issue que cierra este PR. Esto lo cierra automáticamente al
     hacer merge y mueve la tarjeta del tablero a Done (si está integrado). -->
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

## Verificación (gates locales — todo en verde)

- `pnpm install`
- `pnpm --filter backend build`
- `pnpm --filter frontend lint` (solo si se toca frontend)
- Si toca el esquema: `pnpm --filter backend exec prisma migrate status` y `pnpm --filter backend prisma:seed` sin errores

## Checks antes de merge

<!-- Este repo todavía no tiene CI. Cuando el equipo configure checks
     (CI, GitGuardian, etc.), listarlos acá. -->
- Revisión de al menos un integrante del equipo

## Rollback

<!-- Cómo revertir y por qué es seguro (ej.: revert de un commit, docs-only,
     sin impacto en datos/migraciones). Si incluye una migración, explicar
     cómo revertirla o por qué no hace falta. -->

## Etiquetas

<!-- Aplicar al menos una etiqueta de categoría de las existentes. -->
- Categoría: `enhancement` / `bug` / `documentation` / `question`

## Flujo del tablero

<!-- El PR no crea una tarjeta nueva. La tarjeta del issue es la única fuente
     de verdad; este PR se linkea vía Closes #NN. -->
- Mover la tarjeta del issue a "In Review" al abrir este PR
- La tarjeta pasa a "Done" al mergear (si el tablero está integrado con GitHub)
