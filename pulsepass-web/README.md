# PulsePass Web — Fase 5 (Frontend)

SPA en React 19 + TypeScript (strict) + Tailwind CSS v4 que consume la API REST segura de
PulsePass (20 operaciones de la Fase 3 + 3 de autenticación de la Fase 4). Implementa el
`PRD_PulsePass_Frontend_React_TypeScript_Tailwind`.

## Tecnologías

Node 22.22+ · pnpm · Vite 8 · React 19 · TypeScript 6 (strict, `noUncheckedIndexedAccess`) ·
Tailwind CSS v4 (`@tailwindcss/vite`) · React Router v8 (`createBrowserRouter` + `RouterProvider`
de `react-router/dom`) · TanStack Query v5 · React Hook Form + zod · Vitest + Testing Library + MSW ·
ESLint + Prettier (`prettier-plugin-tailwindcss`).

> TypeScript se fija en 6.0 porque `typescript-eslint` todavía no soporta TypeScript 7.

## Comandos

```bash
pnpm install
pnpm dev          # http://localhost:5173 (proxy /api → VITE_PROXY_TARGET)
pnpm build        # tsc -b estricto + build de producción
pnpm lint         # ESLint (prohíbe any, React.FC, enum, react-router-dom, dangerouslySetInnerHTML)
pnpm test         # Vitest + MSW, sin red real
pnpm format       # Prettier
```

## Variables de entorno

Copiar `.env.example` a `.env.local` (no se versiona):

| Variable            | Uso                                                                                                                                                      |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_API_BASE_URL` | Base pública de la API en el navegador. Por defecto `/api`.                                                                                              |
| `VITE_PROXY_TARGET` | Destino del proxy de desarrollo (solo `vite.config.ts`). Por defecto `http://localhost:8080`; con `scripts/Start-E2E.ps1` usar `http://localhost:18080`. |

No hay secretos en el bundle. El proxy de desarrollo elimina el encabezado `Origin` antes de
reenviar a Spring: sin eso, Spring Security trata la petición como CORS y responde **403** a todo
POST/PATCH (login, compras…), porque `PULSEPASS_CORS_ALLOWED_ORIGINS` está vacío (GAP-05). En
producción: servir el frontend en el mismo origen que la API o configurar esa variable.

## Roles de demostración

| Rol   | Qué ve en la interfaz                                            |
| ----- | ---------------------------------------------------------------- |
| —     | Cartelera, detalle, artistas, sedes, registro e inicio de sesión |
| USER  | Compra de entradas, Mis tickets, detalle, cancelación, Mi cuenta |
| STAFF | Validación de ingreso, tickets pagados por evento, Mi cuenta     |
| ADMIN | Lo de STAFF + crear, publicar y asociar artistas a eventos       |

Los usuarios STAFF/ADMIN se crean con la semilla local de la Fase 4 (`tests/e2e/fixtures`). El
registro público siempre crea USER.

## Rutas principales

| Ruta                                      | Página                | Acceso       |
| ----------------------------------------- | --------------------- | ------------ |
| `/`                                       | Inicio                | Público      |
| `/eventos`, `/eventos/:eventCode`         | Cartelera / detalle   | Público      |
| `/artistas`, `/artistas/:id`              | Artistas              | Público      |
| `/sedes`, `/sedes/:code`                  | Sedes                 | Público      |
| `/login`, `/registro`                     | Autenticación         | Solo anónimo |
| `/cuenta`                                 | Mi cuenta             | Autenticado  |
| `/mis-tickets`, `/mis-tickets/:code`      | Tickets propios       | USER         |
| `/compra/confirmacion/:ticketCode`        | Confirmación          | USER         |
| `/staff/validacion`                       | Validación de ingreso | STAFF/ADMIN  |
| `/staff/eventos/:eventCode/tickets`       | Tickets pagados       | STAFF/ADMIN  |
| `/admin/eventos`, `/nuevo`, `/:eventCode` | Administración        | ADMIN        |
| `/403`, `*`                               | Sin permisos / 404    | Público      |

Todas las páginas, salvo Layout e Inicio, se cargan con `lazy`.

## Arquitectura

```
src/
├── main.tsx            QueryClientProvider · AuthProvider · avisos · RouterProvider
├── router.tsx          árbol de rutas, guardas, lazy, errorElement
├── lib/                http.ts (fetch + Bearer + ApiError + zod), rutas, formato, errores, queryClient
├── layouts/            Layout, Navbar, MenuUsuario, Footer, guardas (RutaProtegida/RutaPorRol/SoloAnonimo)
├── componentes/        UI genérica (Boton, Campo, Selector, Modal, Tabla<T>, Aviso, estados…)
├── funcionalidades/    auth · eventos · artistas · sedes · usuarios · tickets · admin
│                       (api.ts + tipos.ts zod + hooks.ts TanStack Query + componentes/)
├── pages/              una página por ruta
└── test/               setup, MSW (23 endpoints), utilidades de render
```

Dirección de dependencias: `pages → funcionalidades → componentes/lib`. `componentes/` y `lib/`
no conocen las funcionalidades; ninguna funcionalidad importa páginas ni layouts.

- La UI presenta y orquesta; no decide. Edad mínima, capacidad, estados y propiedad los decide el
  backend y llegan como 409/403/404 (§13).
- Toda respuesta de la API, el `sessionStorage` y los parámetros de URL se validan con zod.
- El JWT vive en memoria + `sessionStorage` y solo viaja en `Authorization`. Un 401 o el
  vencimiento de `expiresIn` cierran la sesión, limpian la caché y redirigen a `/login`.
- La compra toma el email de la sesión; no existe un campo editable para él.

## Limitaciones conocidas del backend (sin cambios en la API)

- GAP-01: no hay listado de todos los eventos; ADMIN busca por código y ve los creados en la pestaña.
- El backend solo muestra al público eventos `PUBLISHED`; un evento `SOLD_OUT` responde 404
  salvo a STAFF/ADMIN. Si la API devuelve `SOLD_OUT`, el detalle deshabilita la compra (TEST-FE-EVT-006).
- `EventResponse` no trae ciudad ni capacidad de la sede; el detalle las consulta en `/api/venues/{code}`.
- `TicketResponse` no trae el nombre del titular; se muestra su email.

## Pruebas

`pnpm test` ejecuta 100+ pruebas (sección 21 del PRD: LIB, AUTH, EVT, ART, VEN, TKT, STF, ADM,
GEN) con MSW simulando los 23 endpoints y los códigos 400/401/403/404/409/500.
