---
name: Funcionalidad
about: Nueva funcionalidad, endpoint o modelo de datos
labels: enhancement
---

## Qué

<!-- Qué hay que construir. Nombrar concretamente el endpoint, modelo o feature
     (ej.: GET /api/restaurants, modelo Surplus, registro de usuario). -->

## Por qué

<!-- La motivación / necesidad del usuario. Linkear la tarjeta del tablero,
     el sprint o el DER si aplica. -->

## Alcance

<!-- Lista de qué incluye este issue. Ser concreto sobre endpoints,
     campos del esquema, migraciones y docs. -->

- 
- 
- 

## Criterios de aceptación

- [ ] Resultado observable y evidencia que lo verifica:
- [ ] Caso de fallo que debe rechazarse o manejarse:

## Fuera de alcance

<!-- Qué NO está incluido explícitamente. Marcar rutas, cambios de esquema,
     o áreas de otro integrante (ej.: frontend) que no se tocan. -->

- 
- 

## Bloqueado por

<!-- Opcional. Dependencias, datos o decisiones que deben resolverse antes
     de empezar (ej.: dataset de Rebeca, decisión de la PM). Borrar esta
     sección si nada lo bloquea. -->

- 

## Etiquetas

<!-- Aplicar al menos una etiqueta de categoría; no duplicar la prioridad como etiqueta. -->
- Categoría: `enhancement`
- Sprint: `sprint-N` solo con compromiso aprobado; sin etiqueta si sigue en backlog

## Prioridad

<!-- Definir en el campo Priority del tablero: High / Medium / Low.
     Justificar urgencia; no inventar un bloqueo o una vulnerabilidad. -->

## Flujo del tablero

<!-- Después de crear este issue:
1. Para trabajo backend/API portal: asignar a NaferJ y agregar una sola vez:
   gh project item-add 1 --owner Talently-Lab --url <issue-url>
   Tablero: https://github.com/orgs/Talently-Lab/projects/1
2. Setear Status = Todo, Priority y etiquetas; linkear el alcance aprobado en Trello si aplica
3. Mover a In Progress al implementar y a In Review cuando se abra el PR
4. Verificar cierre y Done al completar; no asumir que la automatización está configurada
Para trabajo de otro integrante, confirmar responsable y tablero; no asignarlo a NaferJ automáticamente.
-->

## Hito

<!-- Solo setear si el equipo usa milestones y este issue forma parte
     de una entrega/release acordada. Tareas internas van sin milestone. -->

## Impacto de release

- Decisión: sin cambio de API / patch / minor / major (justificar).
- Si hay release de API aprobado: alinear `backend/package.json`, `backend/openapi.yaml` y `backend/CHANGELOG.md`.
- Tooling/docs/interno: sin bump de API; no sincronizar versiones de todo el monorepo.

## Verificación (gates locales - todo en verde)

- `pnpm --filter backend lint`
- `pnpm --filter backend build`
- `pnpm --filter backend typecheck`
- `pnpm --filter backend check:api` (doble de Prisma, no PostgreSQL real)
- Si toca `api-portal/`: `pnpm --filter api-portal lint`, `pnpm --filter api-portal typecheck` y `pnpm --filter api-portal build`.
- Si toca datos/esquema: definir pruebas en PostgreSQL aislado; nunca migrar o sembrar producción como verificación.
- Para trabajo exclusivo de portal, omitir gates backend sin relación. Para frontend, coordinar con su responsable.
