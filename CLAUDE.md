# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es este repo

FlowSync: monorepo TypeScript de punta a punta con dos apps independientes (cada una con su `package.json` y `node_modules`; no hay workspace raíz):

- `backend/`: API REST en **AdonisJS 7** (Lucid ORM + SQLite, VineJS, auth por access tokens). Ya existe y **en este ejercicio no se modifica**: solo se lee para saber qué exige la API.
- `frontend/`: **React 19 + Vite 8**, todavía la plantilla por defecto de Vite. Aquí es donde se trabaja. El README prevé usar **shadcn/ui** (aún no está instalado: no hay alias `@/`, ni Tailwind, ni `components.json`).

`README.md` es el enunciado del ejercicio del curso (generado, no se edita a mano). `prompts.md` es la plantilla donde el alumno pega sus prompts; tampoco hay que reescribirla.

Requiere **Node.js 24+** (con Node 20 falla con `Unknown file extension ".ts"`).

## Comandos

Backend (`cd backend`), sirve en `http://localhost:3333`:

```bash
npm install && cp .env.example .env && node ace generate:key   # primera vez
node ace migration:run      # crea backend/tmp/db.sqlite3 y regenera database/schema.ts
npm run dev                 # node ace serve --hmr
npm test                    # node ace test (Japa); suites "unit" y "functional"
node ace test functional    # una sola suite
node ace test --files=tests/functional/foo.spec.ts   # un solo archivo
node ace test --tests="nombre del test"              # un solo test
npm run lint | npm run typecheck | npm run format
```

Hoy no hay ningún test escrito (solo `tests/bootstrap.ts`); las suites buscan `tests/unit/**/*.spec.ts` y `tests/functional/**/*.spec.ts`.

Frontend (`cd frontend`), sirve en `http://localhost:5173`:

```bash
npm run dev       # vite
npm run build     # tsc -b && vite build (el typecheck va aquí)
npm run lint      # oxlint
```

El frontend no tiene formateador ni tests configurados.

## Arquitectura del backend

- **Rutas** en `start/routes.ts`, todas bajo `/api/v1`:
  - `POST /auth/signup` → `NewAccountController.store`
  - `POST /auth/login` → `AccessTokensController.store`
  - `GET /account/profile` → `ProfileController.show` (requiere auth)
  - `POST /account/logout` → `AccessTokensController.destroy` (requiere auth)
- Los controladores se referencian vía `controllers` de `#generated/controllers` (`.adonisjs/server/`), un índice **autogenerado** por los hooks de `adonisrc.ts` (`indexEntities`, `generateRegistry` de Tuyau). No editar `.adonisjs/` a mano.
- **Imports por alias** de subpath (`#models/*`, `#validators/*`, `#transformers/*`, …) definidos en `backend/package.json` → `imports`.
- **Modelos**: `database/schema.ts` es **autogenerado** desde las migraciones (`node ace migration:run`); los modelos de `app/models/` extienden esas clases (p. ej. `User extends compose(UserSchema, withAuthFinder(hash))`). Para cambiar columnas: migration nueva, nunca editar `schema.ts`.
- **Respuestas**: `providers/api_provider.ts` añade `ctx.serialize()`, que envuelve todo en `{ data: ... }`. Los **transformers** (`app/transformers/`) deciden qué campos salen; `UserTransformer` expone `id, fullName, email, createdAt, updatedAt, initials`.
- **Auth**: guard por defecto `api` = access tokens (`config/auth.ts`). Login y signup devuelven `{ data: { user, token } }`; el token (prefijo `oat_`) se envía como `Authorization: Bearer <token>`.
- `force_json_response_middleware` fuerza `Accept: application/json`, así que los errores (validación, credenciales inválidas, 401) llegan siempre como JSON con un array `errors`.
- CORS: en desarrollo acepta cualquier origen (`config/cors.ts`).

## Contrato que el frontend debe respetar

Lo marca `app/validators/user.ts`, y va más allá de "email + password":

- **Signup** exige `email` (único, máx. 254), `password` (8–32 caracteres) y **`passwordConfirmation`** (igual que `password`); `fullName` es opcional/nullable. Un email repetido falla en la regla `unique` del validador.
- **Login** exige `email` y `password`; credenciales malas las rechaza `User.verifyCredentials`.

## Reglas de proceso

Toda tarea que cambie código sigue este flujo, sin saltarse pasos:

1. **Rama nueva antes de tocar código.** Créala desde la rama actual, antes de la primera edición, con el formato `tipo/CLAVE-descripcion-corta` (p. ej. `feat/FLOW-1-login-frontend`). Nunca se trabaja directamente sobre `main` ni sobre la rama de partida.
2. **Al cerrar, `/commit`.** Prepara los cambios de la tarea y crea el commit con la skill `/commit`.
3. **Pull request con `gh pr create`**, contra la rama de la que partiste. En la descripción van la clave del ticket, qué se hizo y cómo se verificó.
4. **Revisión con el subagente `adversarial-reviewer`** sobre el PR recién creado. Si encuentra fallos bloqueantes, corrígelos, vuelve a hacer `/commit`, empuja los cambios y repite la revisión.
5. **En el chat, solo la URL del pull request.** Sin resumen de cambios ni lista de archivos: el detalle está en el PR.
