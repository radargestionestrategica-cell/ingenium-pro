<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# INGENIUM PRO — Estado real del proyecto al 23/05/2026

## 1. Estado real

| Ítem | Estado |
|---|---|
| Producción | `https://ingeniumpro.store` (Vercel) |
| Rama activa | `main` — push directo despliega en Vercel |
| Último deploy | `dpl_EryTeqjAYfSzDFor7MNU57vSqyHh` (23/05/2026) |
| Último commit | `038fd60` — fix: AuthGuard siempre session BD sin localStorage |
| Build | `npm run build` = `prisma generate && next build` |
| Tests | `npm test` (Vitest 4) |

**Cambios sin commitear en working tree:**
- `lib/generarPDF.ts` — fix fecha PDF (`new Date()` en lugar de `datos.fecha`) desplegado en Vercel pero NO commiteado a git
- `AGENTS.md` — este archivo

---

## 2. Stack técnico real (fuente: package.json)

### Dependencias activas en uso

| Paquete | Versión | Rol |
|---|---|---|
| `next` | 16.2.2 | Framework — App Router, Turbopack |
| `react` / `react-dom` | 19.2.4 | UI — `'use client'` obligatorio en componentes cliente |
| `typescript` | ^5 | Lenguaje — strict mode, build falla con errores de tipos |
| `@prisma/client` / `prisma` | ^5.22.0 | ORM — singleton en `lib/prisma.ts`, nunca instanciar directo |
| `tailwindcss` | ^4 | Estilos — `@tailwindcss/postcss` |
| `vitest` | ^4.1.5 | Tests unitarios — `lib/__tests__/` |
| `pdfkit` | ^0.18.0 | PDF server-side (Node.js solo) |
| `exceljs` | ^4.4.0 | Excel server-side (Node.js solo) |
| `bcryptjs` | ^3.0.3 | Hash passwords — costo 12, migración automática desde SHA-256 |
| `qrcode` | ^1.5.4 | QR en PDFs — apunta a `ingeniumpro.store/verify/{hash}` |
| `@upstash/redis` | ^1.37.0 | Rate limiting distribuido — fallback in-memory si no hay credenciales |
| `@upstash/ratelimit` | ^2.0.8 | Rate limiting — usado en `/api/chat` |
| `react-markdown` | ^10.1.0 | Render markdown en IAChat |
| `katex` / `rehype-katex` / `remark-math` / `remark-gfm` | varios | Fórmulas matemáticas en chat IA |

### Dependencias en package.json pero SIN uso confirmado en código propio

`@clerk/nextjs`, `@stripe/stripe-js`, `@supabase/supabase-js`, `jsonwebtoken`, `next-auth` — instaladas pero el proyecto usa auth custom HMAC. No tocar.

---

## 3. Endpoints API reales (13 archivos en `app/api/`)

| Ruta | Método | Runtime | Propósito |
|---|---|---|---|
| `/api/v1/auth/login` | POST | Node.js | Login — genera token HMAC, setea cookie `ip_auth` httpOnly, devuelve token en JSON |
| `/api/v1/auth/signup` | POST | Node.js | Registro — crea usuario con `plan: 'demo'`, bcrypt costo 12 |
| `/api/v1/auth/logout` | POST | Node.js | Borra cookie `ip_auth` (maxAge 0) |
| `/api/v1/auth/plan` | GET | Node.js | **Solo middleware** — devuelve `{plan, activo, createdAt}` desde BD. Auth: `Bearer JWT_SECRET` |
| `/api/v1/auth/session` | GET | Node.js | Verifica cookie → consulta BD → genera token fresco con plan real → renueva cookie |
| `/api/v1/calculos/maop` | POST | Node.js | Cálculo MAOP ASME B31.8 |
| `/api/calculos/guardar` | POST | Node.js | Guarda cálculo en BD con hash SHA-256 |
| `/api/calculos/exportar` | POST | Node.js | Genera PDF o Excel. Usa `lib/generarPDF.ts` y `lib/generarExcel.ts` |
| `/api/calculos/historial` | GET | Node.js | Historial de cálculos del usuario autenticado |
| `/api/chat` | POST | Node.js | IA contextual — usa `claude-sonnet-4-6`. Rate limit 20 req/min |
| `/api/perforacion` | POST | Node.js | Cálculos módulo perforación API RP 13D |
| `/api/pagos/checkout` | POST | Node.js | Genera checkout MercadoPago — devuelve `{init_point}` |
| `/api/pagos/webhook` | POST | Node.js | Webhook MercadoPago — verifica firma HMAC, activa plan en BD |

---

## 4. Módulos operativos reales

### Páginas de la app (`app/`)

| Ruta | Archivo |
|---|---|
| `/` | `app/page.tsx` — landing/home |
| `/Login` | `app/Login/page.tsx` |
| `/register` | `app/register/page.tsx` |
| `/dashboard` | `app/dashboard/page.tsx` — protegida por `middleware.ts` + `AuthGuard` |
| `/planes` | `app/planes/page.tsx` |
| `/planes/duo` | `app/planes/duo/page.tsx` |
| `/planes/modulo-unico` | `app/planes/modulo-unico/page.tsx` |
| `/privacidad` | `app/privacidad/page.tsx` |
| `/terminos` | `app/terminos/page.tsx` |
| `/verify/[hash]` | `app/verify/[hash]/page.tsx` — verificación pública de cálculos QR |

### Módulos técnicos (15 componentes en `components/`)

`ModuloPetroleo`, `ModuloCanerias`, `ModuloHidraulica`, `ModuloGeotecnia`, `ModuloTermica`, `ModuloCivil`, `ModuloMineria`, `ModuloSoldadura`, `ModuloElectricidad`, `ModuloMMO`, `ModuloVialidad`, `ModuloRepresas`, `ModuloArquitectura`, `ModuloValvulas`, `ModuloPerforacion`

### Componentes de infraestructura (`components/`)

**Auth / UX:**
`AuthGuard.tsx`, `ErrorBoundary.tsx`, `BienvenidaModal.tsx`, `TerminosModal.tsx`, `TerminosModalWrapper.tsx`

**Dashboard core:**
`DashboardHome.tsx`, `ModulosCarrusel.tsx`, `ExportacionCarrusel.tsx`, `HistorialActivo.tsx`, `IAChat.tsx`, `ConversorUnidades.tsx`, `SelectorIdioma.tsx`, `BotonesExportar.tsx`, `ModuloIntro.tsx`

**Context providers:**
`ProyectoContexto.tsx`, `ResultadoContexto.tsx`

---

## 5. Archivos críticos reales (`lib/` — 16 archivos)

| Archivo | Propósito |
|---|---|
| `prisma.ts` | Singleton `PrismaClient` — única fuente, nunca instanciar directo |
| `api-auth.ts` | `verificarTokenAPI(req)` + `respuestaNoAutorizado()` — usar en todas las rutas protegidas |
| `generarPDF.ts` | Buffer PDF con PDFKit + QR. Solo Node.js. Fecha: `new Date()` al momento de generación |
| `generarExcel.ts` | Buffer Excel con ExcelJS. Solo Node.js |
| `exportarDXF.ts` | DXF en cliente — usa `_usrData` y `_bloqueTitle` |
| `rate-limit.ts` | `rateLimit()` in-memory + `rateLimitAsync()` Upstash Redis con fallback |
| `calculos.ts` | Fórmulas técnicas compartidas entre módulos |
| `jwt.ts` | Helpers JWT custom HMAC-SHA256 |
| `auth.ts` | Helpers auth server-side |
| `cripto.ts` | Hash SHA-256 para cálculos |
| `audit.ts` | Registro auditoría de acciones |
| `validators.ts` | Validadores de entrada para APIs |
| `proyecto.ts` | Helpers gestión proyectos |
| `i18n.ts` | Internacionalización |
| `modulos-intro.ts` | Configuración intros de módulos |
| `db.ts` | Helpers BD adicionales |

### Schema Prisma — modelos reales

**`Usuario`**
```
id, email (unique, lowercase), password (bcrypt), nombre, empresa,
pais (default Argentina), matricula? (default ""), dni? (default ""),
plan (default "trial"), activo (default true), createdAt
```

**`Proyecto`**
```
id, nombre, industria, fluido?, presion_bar?, temp_c?, nps?, material?,
norma (default "ASME B31.8"), H2S_ppm?, zona_elec?, pais, activo,
usuarioId (FK → Usuario), createdAt, updatedAt
```

**`Calculo`**
```
id, tipo, moduloId?, submodulo?, activoNombre?, parametros (Json),
resultado (Json), normativa?, hash? (unique), alerta, alertaMsg?,
usuario (string, default "anonimo"), usuarioId? (FK → Usuario),
proyectoId? (FK → Proyecto), createdAt
```

### Arquitectura de autenticación — reglas críticas

**Capa 1: `middleware.ts` (Edge Runtime)**
- Protege `matcher: ['/dashboard/:path*']`
- Lee cookie httpOnly `ip_auth` — NO leer con `document.cookie`
- HMAC: `crypto.subtle` (Web Crypto API) — NO `crypto.createHmac`
- Llama `/api/v1/auth/plan` vía fetch (AbortController 5s — `AbortSignal.timeout()` NO existe en Edge)
- Expiración demo: `createdAt (BD) + 259_200_000ms` cuando `dbOk=true`
- Sin Prisma, sin Node.js APIs, sin `Buffer`

**Capa 2: `AuthGuard.tsx` (cliente)**
- Siempre llama `/api/v1/auth/session` en cada carga — nunca usa localStorage para evaluar plan
- Escribe token fresco en `localStorage.ip_token` después del call
- Verifica `ip_terminos_aceptados` en localStorage para TerminosModal

**Bypass admin (AMBAS capas):**
```ts
if (payload.email?.toLowerCase() === 'colombosilvanabelen@gmail.com') // acceso irrestricto
```

**Token JWT custom:**
```
base64(JSON.stringify(payload)).HMAC-SHA256(data, JWT_SECRET)
```
Payload: `{ id, email, plan, demoExpira? }` — `demoExpira` solo en `demo`/`trial`.

**Planes válidos:** `demo` | `trial` | `pro` | `team` | `duo` | `modulo` | `enterprise`

**Variables de entorno requeridas:**
```
DATABASE_URL, JWT_SECRET, JWT_SALT,
MP_ACCESS_TOKEN, MP_WEBHOOK_SECRET,
NEXT_PUBLIC_APP_URL, ANTHROPIC_API_KEY,
UPSTASH_REDIS_REST_URL (opcional), UPSTASH_REDIS_REST_TOKEN (opcional)
```

---

## 6. Próximos pasos pendientes

| # | Tarea | Archivo | Prioridad |
|---|---|---|---|
| 1 | Commitear fix de fecha PDF | `lib/generarPDF.ts` | Alta — cambio desplegado sin commit |
| 2 | Commitear AGENTS.md actualizado | `AGENTS.md` | Media |
| 3 | Verificar página `/verify/[hash]` funcional | `app/verify/[hash]/page.tsx` | Media |
| 4 | Limpiar dependencias sin uso confirmado | `package.json` | Baja — @clerk, @stripe, @supabase, jsonwebtoken, next-auth |

---

## Reglas Windows / PowerShell (desarrollo local)

- Shell: PowerShell 5.1 — `&&` NO existe, usar `;` o `if ($?) { B }`
- Variables env: `$env:VAR`, no `$VAR`
- TLS Vercel: `$env:NODE_TLS_REJECT_UNAUTHORIZED = "0"` antes de `vercel --prod`
- npm SSL: `npm config set strict-ssl false` si falla con certificados
- Antes del build: `taskkill /IM node.exe /F` (detiene dev server que bloquea DLL Prisma)
- Deploy: `vercel --prod` (requiere `vercel login` previo)
