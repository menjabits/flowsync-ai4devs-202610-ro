---
name: priority-ticket
description: Trae de Jira el ticket de mayor prioridad asignado al usuario y pendiente, resume sus criterios de aceptación, entra en plan mode para proponer la implementación y, al aprobarse el plan, lo mueve a "En curso". Úsala cuando el usuario pida empezar el siguiente ticket o invoque /priority-ticket.
allowed-tools: mcp__atlassian__getAccessibleAtlassianResources, mcp__atlassian__searchJiraIssuesUsingJql, mcp__atlassian__getJiraIssue, mcp__atlassian__getTransitionsForJiraIssue
---

# /priority-ticket

Sigue estos pasos en orden. No escribas código en ninguno de ellos.

## 1. Encontrar el ticket

1. Obtén el `cloudId` con `getAccessibleAtlassianResources`. Si hay varios sitios, pregunta cuál usar.
2. Busca con `searchJiraIssuesUsingJql`:

   ```
   assignee = currentUser() AND statusCategory = "To Do" ORDER BY priority DESC, updated ASC
   ```

   Filtra por **categoría** de estado, no por nombre: el tablero puede tener los estados en inglés (`To Do`, `Selected for Development`, …) o en español (`Por hacer`).
3. Si no hay resultados, dilo y para: no inventes un ticket ni cojas uno sin asignar.
4. Coge el primero y léelo entero con `getJiraIssue` (`responseContentFormat: "markdown"`).

## 2. Resumirlo

Muestra al usuario, de forma breve:

- Clave, título, prioridad, estado y enlace.
- Los **criterios de aceptación**, como lista numerada y tal cual aparecen en el ticket.
- Los **huecos**: lo que el ticket no especifica y la implementación necesita saber.

## 3. Planificar en plan mode

Llama a `EnterPlanMode` y, dentro de plan mode:

- Contrasta el ticket con el código real antes de proponer nada. Si el ticket toca una API, lee la ruta, el validador y el transformer del backend: el ticket suele omitir campos obligatorios y reglas de validación (ver la sección «Contrato que el frontend debe respetar» de `CLAUDE.md`).
- Respeta las convenciones de `CLAUDE.md` (p. ej., el backend no se modifica).
- El plan debe incluir: archivos que se crean o modifican, dependencias nuevas, cómo cubre cada criterio de aceptación (referenciados por su número) y cómo se verifica.
- Presenta el plan con `ExitPlanMode`.

## 4. Al aprobarse el plan

Solo si el usuario aprueba el plan:

1. Con `getTransitionsForJiraIssue`, busca la transición cuyo estado destino tenga la categoría **In Progress** (`statusCategory.key = "indeterminate"`; se llamará `In Progress` o `En curso`). No uses un id fijo.
2. Aplícala con `transitionJiraIssue` y confirma en una línea que el ticket está en curso.

Si el usuario rechaza el plan o pide cambios, el ticket no se mueve.
