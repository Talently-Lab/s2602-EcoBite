---
name: Datos / DER
about: Cambios de datos, seed, DER o datasets de referencia
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

- `pnpm --filter backend exec prisma migrate status`
- 

## Etiquetas

- Categoría: `documentation` si es solo DER/docs; de lo contrario la que
  mejor aplique de las existentes
- Sprint: trackear en el tablero del equipo

## Prioridad

<!-- Definir en la tarjeta del tablero: Alta / Media / Baja -->

## Flujo del tablero

<!-- Después de crear este issue:
1. Crear o linkear la tarjeta correspondiente en el tablero del equipo
2. Asignarla y setear la prioridad
3. Moverla a "In Progress" al empezar el trabajo
-->

## Hito

<!-- Solo setear si este issue forma parte de una entrega/release acordada.
     Tareas internas de datos van sin milestone. -->
