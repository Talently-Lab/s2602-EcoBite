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

<!-- Aplicar al menos una etiqueta de categoría. Este repo solo tiene las
     etiquetas por defecto de GitHub; si el equipo crea etiquetas de
     sprint (ej.: sprint-3), agregarlas acá. -->
- Categoría: `enhancement`
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

<!-- Solo setear si el equipo usa milestones y este issue forma parte
     de una entrega/release acordada. Tareas internas van sin milestone. -->

## Verificación (gates locales — todo en verde)

- `pnpm install`
- `pnpm --filter backend build`
- Si toca el esquema: `pnpm --filter backend exec prisma migrate status`
- `pnpm --filter frontend lint` (solo si se toca frontend)
