---
name: commit
description: Crea un commit convencional (tipo(scope): descripción) a partir de los cambios preparados (staged). Úsala cuando el usuario pida commitear o invoque /commit.
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git commit:*)
---

# /commit

## Contexto

- Rama: !`git branch --show-current`
- Estado: !`git status --short`
- Cambios preparados: !`git diff --cached --stat`
- Últimos commits (para imitar el estilo): !`git log --oneline -10`

## Pasos

1. Si no hay nada preparado, dilo y para. **No hagas `git add`**: se commitea solo lo que el usuario ha preparado.
2. Lee el diff completo con `git diff --cached` y entiende qué cambia y por qué.
3. Redacta el mensaje en formato Conventional Commits:

   ```
   tipo(scope): descripción

   cuerpo opcional
   ```

   - **tipo**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `build`, `ci`, `chore` o `perf`.
   - **scope**: la parte afectada: `frontend`, `backend`, `harness` (todo lo de `.claude/`, `.mcp.json`, `CLAUDE.md`)… Omítelo si el cambio es transversal.
   - **descripción**: en español, en minúscula, en presente, sin punto final y de 72 caracteres como máximo. Di qué cambia, no qué archivos.
   - **cuerpo**: solo si el porqué no se deduce del título. Si el cambio viene de un ticket de Jira, añade su clave en una línea al final (p. ej. `Refs: FLOW-1`).
   - Si el diff mezcla cambios sin relación, no lo fuerces en un solo commit: díselo al usuario y propón cómo separarlo.
4. Haz el commit con un heredoc, para que se respeten los saltos de línea:

   ```bash
   git commit -F - <<'EOF'
   tipo(scope): descripción

   Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
   EOF
   ```

   Nunca uses `--no-verify` ni `--amend`. Si falla un hook, arregla la causa y vuelve a commitear.
5. Muestra el resultado con `git log --oneline -1`.
