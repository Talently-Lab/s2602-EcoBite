---
name: Datos / DER
about: Cambios de datos, seed, DER o datasets de referencia
labels: data
---

## Qué

<!-- Qué datos hay que crear o actualizar. Nombrar la tabla del DER y las
     entradas concretas (ej.: zonas CABA, empaques, dataset sintético de
     restaurantes/productos). -->

## Por qué

<!-- La motivación. Por qué se necesitan estos datos ahora. Linkear el
     endpoint, sprint o dependencia de otro integrante si aplica. -->

## Alcance

<!-- Qué tablas/archivos se tocan: schema.prisma, migración, seed.ts,
     docs/database/DER.md. Listar los registros o rangos cuando se sepan. -->

- 
- 
- 

## Fuera de alcance

<!-- Qué datos NO están incluidos en esta tarea. -->

- 
- 

## Bloqueado por

<!-- Opcional. Dependencias de datos: Excel de Rebeca, decisión de la PM,
     aprobación del stakeholder. Borrar si nada lo bloquea. -->

- 

## Verificación

<!-- Cómo confirmar los datos: conteos esperados, queries de chequeo,
     seed ejecutado dos veces sin duplicados. -->

- Solo DER/docs: `git diff --check` y consistencia con el esquema.
- Si hay código/esquema: `pnpm --filter backend lint`, `pnpm --filter backend build`, `pnpm --filter backend typecheck`, `pnpm --filter backend check:api`.
- Definir conteos, idempotencia y restricciones a probar con PostgreSQL aislado; los dobles de Prisma no prueban la base real.
- Migraciones, seed o importación aplicada: solo en entorno aislado autorizado, nunca contra producción como gate de rutina.

## Etiquetas

- Categoría: `data`; reemplazar por `documentation` si es solo DER/docs.
- Sprint: `sprint-N` solo con compromiso aprobado; sin etiqueta si sigue en backlog

## Prioridad

<!-- Definir en el campo Priority del tablero: High / Medium / Low, con justificación. -->

## Flujo del tablero

<!-- Después de crear este issue:
1. Para trabajo backend: asignar a NaferJ y agregar una sola vez:
   gh project item-add 1 --owner Talently-Lab --url <issue-url>
   Tablero: https://github.com/orgs/Talently-Lab/projects/1
2. Setear Status = Todo, Priority y etiquetas; linkear la fuente de datos/alcance aprobada
3. Mover a In Progress al implementar y a In Review cuando se abra el PR
4. Verificar cierre y Done al completar; no asumir la automatización
Para tareas de la analista u otro integrante, confirmar responsable y tablero.
-->

## Hito

<!-- Solo setear si este issue forma parte de una entrega/release acordada.
     Tareas internas de datos van sin milestone. -->

## Impacto de release

- DER/docs o mantenimiento interno: sin bump de API.
- Si cambia el contrato/comportamiento público, acordar compatibilidad y release antes de cambiar versiones.
