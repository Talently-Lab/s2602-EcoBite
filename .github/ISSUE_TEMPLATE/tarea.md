---
name: Tarea técnica
about: Tooling, configuración, CI, scripts, dependencias o refactors
labels: tooling
---

## Qué

<!-- Qué cambio de tooling o workflow se necesita (ej.: nuevo workflow de
     GitHub Actions, regla de lint, script de backup, upgrade de dependencia,
     refactor interno sin cambio de comportamiento). -->

## Por qué

<!-- El problema o motivación actual. Qué es lento, manual, propenso a
     errores o falta hoy. -->

## Alcance

<!-- Lista de qué incluye este issue. -->

- 
- 
- 

## Fuera de alcance

<!-- Qué NO está incluido explícitamente. Marcar código de aplicación,
     rutas de API o cambios visibles que no se tocan. -->

- 
- 

## Verificación

<!-- Cómo confirmar que el cambio funciona. Incluir los comandos a correr
     o los pasos manuales a chequear. -->

- Solo plantillas/docs: `git diff --check` y validación de referencias/YAML.
- Backend: `pnpm --filter backend lint`, `pnpm --filter backend build`, `pnpm --filter backend typecheck`, `pnpm --filter backend check:api`.
- API portal: `pnpm --filter api-portal lint`, `pnpm --filter api-portal typecheck`, `pnpm --filter api-portal build`.
- Seleccionar los gates relevantes y agregar evidencia específica del cambio; no conectar producción.

## Etiquetas

- Categoría: `tooling`; reemplazar por `ops` para infraestructura/CI/operaciones o `documentation` si es solo docs.
- Sprint: `sprint-N` solo con compromiso aprobado; sin etiqueta si sigue en backlog

## Prioridad

<!-- Definir en el campo Priority del tablero: High / Medium / Low, con justificación. -->

## Flujo del tablero

<!-- Después de crear este issue:
1. Para trabajo backend/API portal: asignar a NaferJ y agregar una sola vez:
   gh project item-add 1 --owner Talently-Lab --url <issue-url>
   Tablero: https://github.com/orgs/Talently-Lab/projects/1
2. Setear Status = Todo, Priority y etiquetas; no inventar sprint ni release
3. Mover a In Progress al implementar y a In Review cuando se abra el PR
4. Verificar cierre y Done al completar; no asumir la automatización
Las PR de Dependabot son la excepción: conservar su tarjeta sin crear un issue duplicado;
asignar a NaferJ, aplicar ops y mantener las etiquetas de dependencias.
Para trabajo de otro integrante, confirmar responsable y tablero.
-->

## Hito

<!-- Solo setear si este issue forma parte de una entrega/release acordada.
     Tareas de tooling/internas van sin milestone. -->

## Impacto de release

- Tooling, refactor sin cambio de comportamiento y docs: sin bump ni entrada de release de API.
- Si cambia comportamiento público, documentar el impacto y pedir aprobación de release; no bump automático por sprint.
