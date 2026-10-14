---
name: ecobite-issue
description: Redactar o crear issues de EcoBite usando las plantillas de .github/ISSUE_TEMPLATE, con búsqueda de duplicados y creación solo con autorización explícita del usuario.
---

# Issues de EcoBite

Usar esta skill cuando se solicite redactar, preparar o crear un issue en este
repositorio. No implementar el trabajo descrito en el issue.

## Límites

- Trabajar solo en `s2602-EcoBite`. No modificar otros repositorios ni
  configuraciones personales.
- No hacer commits, push ni crear PRs, aunque se cree un issue.
- Redactar no autoriza publicar. Crear un issue únicamente cuando el usuario
  autorice explícitamente su creación en el repositorio identificado.
- No crear ni modificar etiquetas, hitos o tarjetas sin autorización para esas
  acciones. No asignar personas ni inventar políticas de otro proyecto.
- No incluir secretos, tokens, credenciales, datos personales ni contenido de
  `.env` en el cuerpo, archivos temporales, comandos o respuestas. Sanitizar
  logs y ejemplos antes de usarlos; no leer secretos para redactar el issue.

## 1. Leer las reglas y elegir la plantilla

Leer el `AGENTS.md` actual y las instrucciones aplicables antes de trabajar.
Leer `.github/ISSUE_TEMPLATE/config.yml` y las plantillas actuales; son la
fuente de verdad, no una copia mantenida dentro de esta skill:

| Solicitud | Plantilla |
| --- | --- |
| Error o comportamiento incorrecto | `.github/ISSUE_TEMPLATE/error.md` |
| Nueva funcionalidad, endpoint o modelo | `.github/ISSUE_TEMPLATE/funcionalidad.md` |
| Tooling, configuración, CI, scripts, dependencias o refactor | `.github/ISSUE_TEMPLATE/tarea.md` |
| Datos, seed, DER o datasets de referencia | `.github/ISSUE_TEMPLATE/datos.md` |

Si la clasificación o el alcance son ambiguos, preguntar. Leer los archivos
pertinentes para respaldar la descripción; distinguir hechos comprobados,
propuestas y datos pendientes.

## 2. Identificar el repositorio y buscar duplicados

Ejecutar `git remote -v` en este worktree. Usar el remoto fuente configurado
para obtener `OWNER/REPO`; nunca usar `local`, que apunta al checkout del
usuario. No asumir que el remoto se llama `origin`. Si falta un remoto fuente,
hay varios candidatos ambiguos o no corresponde a EcoBite, pedir confirmación.
Usar `--repo OWNER/REPO` explícitamente en cada comando de issues.

Antes de finalizar el borrador o publicar, buscar issues abiertos y cerrados
con términos de la funcionalidad, error, endpoint o archivo:

```sh
gh issue list --repo OWNER/REPO --state all --search "TERMINOS" --limit 100 --json number,title,state,url
gh issue view NUMERO --repo OWNER/REPO --json title,body,state,url
gh label list --repo OWNER/REPO --limit 100
```

Sustituir los marcadores por valores verificados. Hacer búsquedas adicionales
si el resultado está limitado o una consulta demasiado específica podría
ocultar coincidencias. Leer los candidatos relevantes, no decidir solo por
el título. Si hay un duplicado, presentar su URL y proponer reutilizarlo;
no crear otro ni editar el existente sin autorización. Si `gh` o la búsqueda
fallan, informar que la comprobación quedó pendiente, no afirmar que no hay
duplicados y no publicar hasta resolverla.

## 3. Redactar con la estructura original

- Escribir título y cuerpo en español, salvo que el usuario pida otro idioma;
  conservar siempre los encabezados españoles, su orden y la estructura de
  la plantilla elegida.
- El frontmatter de la plantilla es metadata: no pegarlo en el cuerpo del
  issue. Respetar sus etiquetas (`bug` o `enhancement`) si existen y verificar
  las demás con `gh label list`; no importar etiquetas de otros repositorios.
- Reemplazar comentarios de ayuda y listas vacías con contenido concreto.
  Mantener todas las secciones requeridas. Omitir `## Bloqueado por` solamente
  cuando la plantilla lo permite y no hay bloqueos.
- Delimitar alcance y fuera de alcance, dependencias, pasos reproducibles y
  verificación según la plantilla. No inventar decisiones, responsables,
  datos de restaurantes/productos, resultados de pruebas ni entregas.
- Los comandos de verificación son gates propuestos, no evidencia de ejecución.
  Ajustarlos al área afectada y a `AGENTS.md`, usando pnpm. Señalar información
  desconocida como pendiente o pedirla si bloquea la creación.
- Usar hitos solo para entregas/releases acordadas; tareas internas van sin
  milestone conforme a las plantillas.

## 4. Resolver el tablero sin suposiciones

Consultar la configuración y documentación actuales de EcoBite o solicitar
la URL/identidad al usuario. `config.yml` puede dejar el tablero por confirmar;
eso no establece un GitHub Project ni un tablero de Trello concreto.
No copiar IDs, propietario, campos, estados, prioridades, sprints, asignaciones
ni reglas del tablero de Poxyram.

Conservar `## Prioridad` y `## Flujo del tablero` de la plantilla. Si el tablero
no está confirmado, indicar que su enlace, asignación y prioridad quedan
pendientes; no bloquear un issue autorizado solo por ese motivo. Si el usuario
autoriza operar el tablero, verificar primero su identidad, campos y valores.
Las plantillas piden crear o linkear la tarjeta, asignarla y definir prioridad,
y moverla a "In Progress" al empezar el trabajo, no al redactar el issue.
Trackear el sprint en el tablero del equipo según las plantillas.

## 5. Entregar el borrador o crear con autorización

Para una solicitud de redacción, entregar repositorio destino, plantilla,
título, cuerpo Markdown, etiquetas verificadas, duplicados encontrados y
pendientes. No ejecutar `gh issue create`.

Para una creación explícitamente autorizada, resolver primero los bloqueos y
verificar que el contenido y destino estén dentro de lo autorizado. Guardar
el cuerpo revisado en un archivo temporal de la sesión, fuera de los archivos
versionados, y publicar siempre con `--body-file`:

```sh
gh issue create --repo OWNER/REPO --title "TITULO" --body-file "RUTA_TEMPORAL"
```

Agregar `--label`, `--assignee` o `--milestone` solo con valores verificados y
autorizados. No pasar el Markdown con `--body` inline: `--body-file` conserva
backticks, saltos de línea y caracteres españoles, también en PowerShell.
Si la creación falla o su resultado es ambiguo, comprobar si el issue existe
antes de reintentar para evitar duplicados.

Tras crear, leer el issue publicado y reportar su URL, metadata aplicada y
cualquier acción de tablero pendiente. No afirmar que hubo asignación,
priorización o movimiento de tarjeta si no se realizó y verificó.
