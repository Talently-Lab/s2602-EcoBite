---
name: Reporte de error
about: Algo no funciona como debería
labels: bug
---

## Qué pasa

<!-- Comportamiento actual. Pegar el mensaje de error exacto si existe. -->

## Qué debería pasar

<!-- Comportamiento esperado según el DER, el brief del sprint o el contrato
     de la API. -->

## Cómo reproducirlo

<!-- Pasos mínimos. Incluir el endpoint, el body de ejemplo o el comando. -->

1. 
2. 
3. 

## Entorno

<!-- SO, versión de Node, cómo corre la DB (Docker Compose), rama/commit. -->

## Alcance de la corrección

<!-- Qué se va a tocar. Si todavía no se sabe, dejarlo para la
     investigación y completarlo al diagnosticar. -->

- 

## Verificación de la corrección

- [ ] Reproducción o test que falla antes del cambio.
- [ ] El mismo caso pasa después del cambio; indicar la evidencia.
- Backend: `pnpm --filter backend lint`, `pnpm --filter backend build`, `pnpm --filter backend typecheck`, `pnpm --filter backend check:api`.
- API portal: `pnpm --filter api-portal lint`, `pnpm --filter api-portal typecheck`, `pnpm --filter api-portal build`.
- Seleccionar los gates del componente afectado; no usar secretos ni producción.

## Fuera de alcance

<!-- Qué NO se va a tocar para resolver este error. -->

- 

## Etiquetas

- Categoría: `bug`
- Sprint: `sprint-N` solo con compromiso aprobado; sin etiqueta si sigue en backlog

## Prioridad

<!-- Definir en el campo Priority del tablero: High / Medium / Low.
     Priorizar fallos de seguridad, integridad de datos y comportamiento requerido. -->

## Flujo del tablero

<!-- Después de crear este issue:
1. Para trabajo backend/API portal: asignar a NaferJ y agregar una sola vez:
   gh project item-add 1 --owner Talently-Lab --url <issue-url>
   Tablero: https://github.com/orgs/Talently-Lab/projects/1
2. Setear Status = Todo, Priority y etiquetas; registrar la reproducción sin datos sensibles
3. Mover a In Progress al implementar y a In Review cuando se abra el PR
4. Verificar cierre y Done al completar; una PR cerrada sin merge no prueba la corrección
Para errores de otro integrante, confirmar responsable y tablero.
-->

## Impacto de release

- Si corrige comportamiento público de la API: proponer patch (o justificar otra versión) y actualizar el changelog en un release aprobado.
- Si es tooling/interno/portal sin cambio de API: sin bump de API.
