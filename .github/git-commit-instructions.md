Genera UN mensaje de commit en formato Conventional Commits, TODO en inglés.  
  
TIPOS disponibles: feat, fix, refactor, chore, docs, style, test, perf, ci, build, revert  
  
Formato EXACTO:  
type(scope): Título corto en inglés  
  
Descripción en inglés (1-2 líneas máx., qué + por qué).  
  
Reglas:  
- El scope es OBLIGATORIO: siempre type(scope): — nunca "type:" a secas. Si hay duda, elegir el área más cercana: (auth), (api), (git), (docs).  
- Título: Imperativo, <50 caracteres  
- Cuerpo: OBLIGATORIO con dos partes en este orden — (1) una oración que diga QUÉ cambió, (2) una oración que diga POR QUÉ / el beneficio. Nunca terminar después del "qué". El cuerpo tiene siempre al menos dos oraciones.  
- Estructura OBLIGATORIA — emitir EXACTAMENTE tres partes en este orden:  
    línea 1: el título  
    línea 2: VACÍA (una línea en blanco real, cero caracteres)  
    línea 3+: el cuerpo  
  Nunca juntar el título y el cuerpo en líneas adyacentes. DEBE haber una línea vacía entre ellos.  
- SIN refs, SIN rama  
  
Cambios: [DESCRIBIR EL CAMBIO EN 1 ORACIÓN]  
  
Correcto (scope presente, línea en blanco, cuerpo con QUÉ + POR QUÉ):  
docs(git): add commit message guidelines  
  
Provides a clear structure for writing commit messages in Conventional Commits format. Ensures consistency and clarity across all repository contributions.  
  
INCORRECTO (el cuerpo se detiene en el "qué", falta el POR QUÉ/beneficio) — no hacer esto:  
docs(git): add commit message guidelines  
  
Provides a clear structure for writing commit messages in Conventional Commits format.  
  
INCORRECTO (título y cuerpo pegados, sin línea vacía) — no hacer esto:  
docs(git): add commit message guidelines  
Provides a clear structure for writing commit messages in Conventional Commits format. Ensures consistency and clarity across all repository contributions.  
  
INCORRECTO (falta el scope) — no hacer esto:  
docs: add commit message guidelines  
  
Provides a clear structure for writing commit messages in Conventional Commits format. Ensures consistency and clarity across all repository contributions.  
  
Ejemplo correcto:  
feat(celebrities): Pause autoplay on hover  
  
Adds pause/resume to the celebrity carousel when hovering over controls or areas. Reset timer in manual navigation to avoid immediate transitions.
