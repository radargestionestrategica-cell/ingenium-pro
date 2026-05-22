@AGENTS.md

# INGENIUM PRO — Contexto del proyecto para Claude Code

## Identidad y deploy

- **Producto:** INGENIUM PRO — plataforma técnica de cálculo de ingeniería
- **Dominio:** `ingeniumpro.store`
- **Deploy:** Vercel (producción). Variable `NEXT_PUBLIC_APP_URL=https://ingeniumpro.store`
- **Repositorio:** `https://github.com/radargestionestrategica-cell/ingenium-pro`
- **Rama principal:** `main` — push directo a main despliega en Vercel automáticamente
- **Email administradora:** `colombosilvanabelen@gmail.com`

---

## Stack técnico exacto

| Capa | Tecnología |
|---|---|
| Framework | Next.js **16.2.2** (App Router, Turbopack) |
| Runtime UI | React **19.2.4** |
| Lenguaje | TypeScript 5 |
| ORM | Prisma **5.22.0** |
| Base de datos | PostgreSQL — **Neon** serverless (`DATABASE_URL`) |
| Estilos | Tailwind CSS 4 |
| Tests | Vitest 4 (`npm test`) |
| Rate limiting | Upstash Redis (`UPSTASH_REDIS_REST_URL/TOKEN`) con fallback in-memory |
| PDF export | PDFKit |
| Excel export | ExcelJS |
| Build | `npm run build` = `prisma generate && next build` |

---

## Arquitectura de autenticación — DOS capas independientes

### Capa 1: Middleware (Edge Runtime — `middleware.ts`)
- Protege rutas: `matcher: ['/dashboard/:path*']`
- Lee el cookie **httpOnly** `ip_auth` de la request
- Verifica firma HMAC-SHA256 del token
- Llama `/api/v1/auth/plan` (Node.js) para obtener plan real desde BD
- Calcula expiración demo con `createdAt` real de BD (no con campo del token)
- **Runtime:** V8 Edge — NO puede usar Prisma directamente. Usa `fetch` interno.
- `AbortSignal.timeout()` NO existe en Edge Runtime — usar `AbortController` + `setTimeout`

### Capa 2: AuthGuard (cliente — `components/AuthGuard.tsx`)
- Se ejecuta en el browser al renderizar cualquier página de `/dashboard`
- Lee `ip_token` de `localStorage`
- Si `localStorage` está vacío → llama `GET /api/v1/auth/session` como fallback
- El endpoint session devuelve token fresco desde BD y renueva el cookie

### Regla de bypass admin (ambas capas)
```
if (payload.email?.toLowerCase() === 'colombosilvanabelen@gmail.com') → acceso irrestricto
```
El bypass ignora plan, demoExpira, activo y cualquier otra verificación.

---

## Formato del token JWT (custom — NO es jsonwebtoken estándar)

```
base64url(JSON.stringify(payload)).HMAC-SHA256(data, JWT_SECRET)
```

**Campos del payload:**
```ts
{
  id:          string;   // cuid del usuario en BD
  email:       string;   // email en minúsculas (normalizado en login)
  plan:        string;   // valor real del plan
  demoExpira?: number;   // solo presente si plan === 'demo' || 'trial'
                         // valor: usuario.createdAt.getTime() + 259_200_000
}
```

- Secret: `process.env.JWT_SECRET` (fallback: `'ingenium_jwt_2026'`)
- Cookie `ip_auth`: httpOnly, secure en producción, sameSite lax, maxAge 259200s (3 días)
- LocalStorage `ip_token`: mismo valor que el cookie, guardado por el Login page

---

## Valores válidos de `plan`

| Valor | Tipo | Fuente |
|---|---|---|
| `demo` | Registro nuevo | `signup/route.ts` hardcodeado |
| `trial` | Default BD | `schema.prisma` default |
| `pro` | Pago MP | webhook activa automáticamente |
| `team` | Pago MP | webhook activa automáticamente |
| `duo` | Pago MP | webhook activa automáticamente |
| `modulo` | Pago MP | webhook activa automáticamente |
| `enterprise` | Manual BD | Solo vía actualización directa en BD |

---

## Expiración demo — regla exacta

```
demoExpira = usuario.createdAt.getTime() + 259_200_000   // 3 días en ms
```

- Calculado en `login/route.ts` al generar el token (solo para `demo` y `trial`)
- **El middleware calcula expiración desde `createdAt` de BD** cuando `dbOk=true` — robusto contra tokens viejos sin el campo `demoExpira`
- Al expirar → redirige a `/planes?demo=expired`

---

## Endpoints de autenticación

| Endpoint | Método | Runtime | Propósito |
|---|---|---|---|
| `/api/v1/auth/login` | POST | Node.js | Login, genera token, setea cookie, devuelve token en JSON |
| `/api/v1/auth/signup` | POST | Node.js | Registro, crea usuario con `plan: 'demo'` |
| `/api/v1/auth/logout` | POST | Node.js | Borra cookie `ip_auth` (maxAge 0) |
| `/api/v1/auth/plan` | GET | Node.js | Interno (solo middleware). Devuelve `{ plan, activo, createdAt }` desde BD. Auth: `Bearer JWT_SECRET` |
| `/api/v1/auth/session` | GET | Node.js | Verifica cookie → consulta BD → genera token fresco con plan real → renueva cookie. Usado por AuthGuard como fallback |

---

## Verificación de tokens en rutas API

Usar `lib/api-auth.ts`:
```ts
import { verificarTokenAPI, respuestaNoAutorizado } from '@/lib/api-auth';
const payload = verificarTokenAPI(req);  // lee cookie ip_auth o Authorization Bearer
if (!payload) return respuestaNoAutorizado();
```

---

## Pagos

### MercadoPago (ARS — suscripciones)
- Checkout: `POST /api/pagos/checkout` — recibe `{ planId }`, devuelve `{ init_point }`
- Webhook: `POST /api/pagos/webhook` — verifica firma HMAC, activa plan en BD
- Mapeo `preapproval_plan_id → plan`:

| preapproval_plan_id | plan |
|---|---|
| `e13b7ec1809545f0965ff3ac21b06291` | `modulo` |
| `87cce369f7fb45a3a08d9abad3660184` | `duo` |
| `7977d5695fec4f99be5cc3e56c7b9428` | `pro` |
| `a82fae7648024090a3b6dc195d136ccd` | `team` |

- Env vars requeridas: `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET`

### PayPal (USD)
- Link directo: `paypal.me/ingeniumpro`
- No tiene webhook automático — activación manual del plan en BD

---

## Schema Prisma — modelo `Usuario`

```prisma
model Usuario {
  id        String     @id @default(cuid())
  email     String     @unique          // siempre lowercase (normalizado en login)
  password  String                      // bcrypt costo 12 (migrado de SHA-256 legacy)
  nombre    String
  empresa   String
  pais      String     @default("Argentina")
  matricula String?    @default("")
  dni       String?    @default("")
  plan      String     @default("trial")
  activo    Boolean    @default(true)
  createdAt DateTime   @default(now())
  calculos  Calculo[]
  proyectos Proyecto[]
}
```

**Nota:** `matricula` y `dni` son opcionales — siempre incluirlos juntos en nuevas features.

---

## Módulos técnicos del dashboard (15)

`ModuloPetroleo`, `ModuloCanerías`, `ModuloHidraulica`, `ModuloGeotecnia`, `ModuloTermica`, `ModuloCivil`, `ModuloMineria`, `ModuloSoldadura`, `ModuloElectricidad`, `ModuloMMO`, `ModuloVialidad`, `ModuloRepresas`, `ModuloArquitectura`, `ModuloValvulas`, `ModuloPerforacion`

Exportaciones por módulo: PDF (server, Prisma), Excel (server, Prisma), DXF (client, `_usrData`/`_bloqueTitle`).

---

## Reglas críticas de desarrollo

### Windows / PowerShell
- Shell principal: **PowerShell 5.1** — NO bash por defecto
- `&&` NO existe en PowerShell — usar `;` o `if ($?) { B }`
- Variables de entorno: `$env:VAR`, no `$VAR`
- Paths con espacios: siempre entre comillas dobles

### Next.js 16.2.2 — diferencias clave
- El archivo `middleware.ts` genera advertencia de deprecación — ignorar, sigue funcionando
- `cookies()` de `next/headers` es **async** en esta versión — usar `await cookies()`
- Edge Runtime (`middleware.ts`): sin Node.js APIs, sin Prisma, sin `AbortSignal.timeout()`
- App Router: toda la lógica de servidor en `app/`, componentes cliente con `'use client'`

### Prisma
- Siempre ejecutar `prisma generate` antes del build (incluido en `npm run build`)
- `lib/prisma.ts` usa singleton global — no instanciar `PrismaClient` directamente
- Migraciones: `npx prisma migrate dev` (local) / `npx prisma migrate deploy` (producción)

### Auth — invariantes a no romper
1. El cookie `ip_auth` SIEMPRE httpOnly — nunca leer con `document.cookie`
2. El bypass admin por email va en **ambas** capas: `middleware.ts` Y `AuthGuard.tsx`
3. Las rutas API internas (como `/api/v1/auth/plan`) usan `Authorization: Bearer JWT_SECRET`
4. El middleware NO puede llamar a Prisma — solo via fetch a rutas Node.js internas
5. El email en BD y en tokens está siempre en **minúsculas**

---

## Variables de entorno requeridas

```
DATABASE_URL              # Neon PostgreSQL connection string
JWT_SECRET                # HMAC secret para tokens (fallback: 'ingenium_jwt_2026')
JWT_SALT                  # Salt para hash SHA-256 legacy (fallback: 'ingenium_salt_2026')
MP_ACCESS_TOKEN           # MercadoPago access token
MP_WEBHOOK_SECRET         # MercadoPago webhook signature secret
NEXT_PUBLIC_APP_URL       # https://ingeniumpro.store
UPSTASH_REDIS_REST_URL    # Opcional — rate limiting Redis
UPSTASH_REDIS_REST_TOKEN  # Opcional — rate limiting Redis
```
