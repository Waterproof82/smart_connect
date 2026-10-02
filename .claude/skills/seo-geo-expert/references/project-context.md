# Contexto del proyecto — SmartConnect AI (leer en Fase 0)

> Verifica contra el código antes de afirmar: esto es una guía, no una fuente de verdad.

## Identidad
- **Dominio canónico:** `https://digitalizatenerife.es/` (única base para canonical, OG, hreflang, sitemap, JSON-LD, `llms.txt`).
- **NUNCA** usar `smartconnectai.es` (no oficial). Si aparece en el repo → hallazgo.
- Negocio: agencia-escuela para hostelería local (QRIBAR carta digital, tarjetas NFC/QR de reseñas, TPV, chatbot RAG, automatización). Público: dueños de bares/restaurantes/cafés sin perfil técnico, Tenerife/Canarias.
- Cada recomendación debe orientarse a captación y conversión (formulario de contacto, WhatsApp, demo).

## Stack (no es Next.js)
- React 19 + Vite + TypeScript + Tailwind + Zod + React Hook Form.
- **SSR/prerender propio:** `src/entry-server.tsx`, `src/entry-client.tsx` → verificar paridad de árbol SSR/hidratación (errores de hydration = riesgo SEO). Ignora las secciones Next.js del checklist salvo equivalentes (metadata en `LandingContainer.tsx`).
- i18n ES/EN: `src/shared/context/LanguageContext.tsx` (claves `seoTitle`, `seoDescription`, `seoProductDescription`…). Cero strings hardcodeadas.
- Landing: `src/features/landing/presentation/` (`LandingContainer.tsx` genera meta tags y JSON-LD `@graph`).
- Hosting: Vercel (`vercel.json` con cabeceras y `Link`), dev: `vite.config.ts`.
- Backend: Supabase (Edge Functions, pgvector), n8n, Gemini. `/admin` es lazy y **no debe indexarse** (verificar noindex/robots).

## Archivos SEO/GEO existentes
- `public/robots.txt` (reglas bots IA + `Content-Signal: search=yes, ai-input=yes, ai-train=no`; mantener idéntico en `vercel.json` y `vite.config.ts`).
- `public/llms.txt` y `public/.well-known/` (`llms.txt`, `mcp/server-card.json`, `agent-skills/index.json` con `sha256`, `api-catalog`, `openid-configuration`, `oauth-protected-resource`, `jwks.json`). Si se edita `llms.txt`, **recalcular el sha256** de `agent-skills/index.json`.
- `docs/SEO_IMPLEMENTATION.md`, `docs/audit/` (p. ej. `2026-10-01_gsc-search-performance-analysis.md`: leer antes de analizar GSC para no repetir trabajo).

## Comandos de validación
`npm run lint` · `npm run type-check` · `npm test` · `npm run build`.

## Documentación obligatoria según tarea
Seguridad → `docs/context/security_agent.md` · Testing → `docs/context/readme_testing.md` · ADR → `docs/context/adr.md`.
