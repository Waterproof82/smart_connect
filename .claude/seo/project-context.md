# Contexto SEO del proyecto — Digitaliza Tenerife / smart-connect (leer en Fase 0)

> Lo lee el skill global `seo-geo-expert`. Verifica contra el código antes de afirmar: esto es una guía, no una fuente de verdad.

## Identidad
- **Dominio canónico:** `https://digitalizatenerife.es/` (única base para canonical, OG, hreflang, sitemap, JSON-LD, `llms.txt`).
- **NUNCA** usar `smartconnectai.es` (no oficial). Si aparece en el repo → hallazgo. `smart-connect-olive.vercel.app` redirige con 308 al dominio oficial.
- Negocio: agencia-escuela para hostelería local (carta digital, tarjetas NFC/QR de reseñas, TPV, chatbot RAG, automatización). Público: dueños de bares/restaurantes/cafés sin perfil técnico, Tenerife/Canarias.
- NAP real: ver memoria `business-nap-real-address` y `src/shared/config/organization.ts`.
- Cada recomendación debe orientarse a captación y conversión (formulario de contacto, WhatsApp, demo).

## Stack y render (no es Next.js)
- React 18 + Vite 8 + TypeScript + Tailwind 4 + Zod + React Hook Form (fuente de verdad: `package.json`).
- **SSR/prerender propio:** `src/entry-server.tsx`, `src/entry-client.tsx`, `scripts/prerender.mjs`, rutas en `scripts/site-routes.json` → verificar paridad de árbol SSR/hidratación (errores de hydration = riesgo SEO).
- i18n ES/EN: `src/shared/context/LanguageContext.tsx`. Cero strings hardcodeadas. Copy en español de España (sin voseo).
- Metadata y JSON-LD: Helmet en cada página; schemas en `src/shared/presentation/components/SeoSchema.tsx`.
- Hosting: Vercel (`vercel.json` con cabeceras, redirects y `Link`) detrás de Cloudflare (proxy); dev: `vite.config.ts`.
  - `www` → apex se configura en Vercel → Settings → Domains → Redirect → **308**. No duplicar en Cloudflare. `http://www` hace 301 (Cloudflare "Always Use HTTPS") + 308 (Vercel): aceptable.
  - Cloudflare Email Obfuscation debe seguir **desactivada** (rompía el email para agentes sin JS, F-16).
- Backend: Supabase (Edge Functions, pgvector), n8n, Gemini. `/admin`, `/panel`, `/login` → `_spa.html`, noindex.
  - Las Edge Functions rechazan por CORS el host de los previews de Vercel: probar el chat de punta a punta en producción.
  - Si el chatbot falla, revisar primero `query_logs` con `source = 'function_logs'`. Un 402 `RESOURCE_EXHAUSTED` de Gemini = créditos agotados (acción del propietario), no bug.
- Imágenes: `scripts/optimize-images.mjs`.

## Archivos SEO/GEO
- `public/robots.txt`: reglas de bots IA + `Content-Signal: search=yes, ai-input=yes, ai-train=no`; mantener idéntico en `vercel.json` y `vite.config.ts`.
- `public/llms.txt` y `public/.well-known/` (`llms.txt` puntero, `mcp/server-card.json`, `agent-skills/index.json` con `sha256`). Recursos experimentales. Si se edita `llms.txt`, **recalcular el sha256** de `agent-skills/index.json`.
- Markdown negotiation (`Accept: text/markdown`): `middleware.ts` + `api/negotiate.mjs` + `vite-plugin-md-negotiation.ts`.
- Docs: `docs/SEO_PROTOCOL.md`, `docs/SEO_IMPLEMENTATION.md`, `docs/audit/` (p. ej. `2026-10-01_gsc-search-performance-analysis.md`: leer antes de analizar GSC).
- Analytics: GA4 `G-F9KQ7X8TSQ`, Consent Mode v2 en `index.html`. Clics `tel:`/`mailto:`/WhatsApp en `src/shared/utils/analyticsEvents.ts`. Eventos: `generate_lead`, `contact_whatsapp`, `contact_phone`, `contact_email`, `chatbot_demo_open`. **Conversiones fiables desde 2026-10-05.**
- Leads: pipeline n8n → Google Sheets (temperatura y estado).

## Tests de regresión del repo

| Archivo | Cubre | Requiere build |
|---|---|---|
| `tests/unit/seo/seoSources.regression.test.ts` | robots.txt, coherencia de `Content-Signal` (robots/vercel/vite), dominio oficial, JSON de `.well-known`, puntero `llms.txt`, `site-routes.json`, redirects, cabeceras de indexación/HSTS/nosniff | No |
| `tests/unit/seo/prerenderedSeo.regression.test.ts` | Por ruta de `dist/`: `lang`, title/description únicos, canonical, OG, sin noindex, un H1, headings, JSON-LD, imágenes, enlaces; sitemap = rutas = canonicals; `404.html` noindex | Sí (`describe.skip` sin `dist/`) |

Complementan: `geoSurfaces`, `routeParity`, `vercelNotFound`, `criticalCssOutput`.

Guardas de Core Web Vitals:

| Archivo | Cubre |
|---|---|
| `tests/unit/perf/fontSelfHosting.test.ts` | Fuentes propias, CSP `font-src 'self'`, `font-display: optional`, una sola precarga (H1), DM Sans sin `opsz` y ≤ 56.000 B |
| `tests/unit/perf/fontFallbackMetrics.test.ts` | `size-adjust` medido (106 %) y `.ds-h1 { text-wrap: wrap }` |
| `tests/unit/scripts/criticalCssOutput.test.ts` | Fuentes inlineadas y un `<link>` CSS diferido por ruta |
| `tests/unit/vite/manualChunks.test.ts` | Chunks por nombre exacto de paquete |
| `tests/unit/webmcpBoot.test.ts`, `entryWiring.structure.test.ts` | WebMCP fuera del chunk de entrada, registrado tras hidratar |
| `src/shared/utils/appStylesheet.test.ts`, `useAppStylesheetApplied.test.tsx`, `CookieConsent.structure.test.ts`, `DeferredExpertAssistant.test.tsx` | Elementos `fixed` no se montan antes del CSS diferido |

Trampas locales: `vite preview` no aplica `/admin → /_spa.html` (errores #418/#422 falsos); `build` en `.gitignore` sin `/` ignora `tests/unit/build/`.

**CI:** `.github/workflows/ci-cd.yml` ejecuta `npx jest tests/unit/seo` después de `npm run build`. Los tests no llevan comentarios (`docs/context/readme_testing.md`).

## Comandos de validación
`npm run lint` · `npm run type-check` · `npm run knip` · `npm test` · `npx vitest run` · `npm run build` (solo con autorización del propietario).

## Protocolos de documentación
CHANGELOG (inglés, Keep a Changelog, CRLF) · audit log `docs/audit/YYYY-MM-DD_<tema>.md` · guías: seguridad `docs/context/security_agent.md`, testing `docs/context/readme_testing.md`, ADR `docs/context/adr.md`. Medir rendimiento en PSI desde España, varias pasadas.
