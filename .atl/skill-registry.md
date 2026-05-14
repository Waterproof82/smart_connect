# Skill Registry — smart-connect

_Last updated: 2026-05-14_

## Global Skills (from Engram)

| Skill                   | Triggers (Code)                    | Triggers (Task)                                                      | Description                                                                                                                                                     |
| ----------------------- | ---------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| work-unit-commits       | `*.tsx`, `*.ts`, `src/*`           | implement, commit, PR, review                                        | Structure commits as deliverable work units instead of file-type batches, with tests and docs kept beside the code they verify.                                 |
| chained-pr              | `*.ts`, `*.tsx`                    | PR, review, split                                                    | Split large changes into chained or stacked pull requests that protect reviewer focus and stay within Gentle AI's 400-line cognitive review budget.             |
| cognitive-doc-design    | `*.md`, `docs/*`                   | docs, documentation, guide                                           | Design documentation that reduces reader cognitive load through progressive disclosure, chunking, signposting, tables, checklists, and recognition over recall. |
| audit                   | `*.tsx`, `src/features/*`          | audit, review, quality                                               | Perform comprehensive audit of interface quality across accessibility, performance, theming, and responsive design.                                             |
| harden                  | `*.tsx`, `src/shared/utils/*`      | error, i18n, edge-cases                                              | Improve interface resilience through better error handling, i18n support, text overflow handling, and edge case management.                                     |
| judgment-day            | `*.tsx`, `src/features/*`          | review, adversarial, judge                                           | Parallel adversarial review protocol that launches two independent blind judge sub-agents simultaneously to review the same target.                             |
| smart-connect-standards | `src/*`, `docs/*`, `*.tsx`, `*.ts` | architecture, design, security, testing, rag, gemini, best-practices | Global standards for SmartConnect ecosystem: Clean Architecture, DI, Jest+RTL testing, OWASP security, RAG chatbot, environment compatibility.                  |

**Reference**: [SmartConnect Standards Documentation](.atl/smart-connect-standards.md)

## Project Conventions

| File                              | Description                                                                                                |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `CLAUDE.md`                       | Main agent instructions, SDD orchestrator protocol, design context, brand personality, project conventions |
| `.opencode/sdd-profile-free.json` | SDD FREE profile — model assignments per phase, blocked models, fallback logic                             |

## Deprecated Skills

| Skill            | Description                                                                    |
| ---------------- | ------------------------------------------------------------------------------ |
| qribar-standards | Deprecated in favor of `smart-connect-standards` for global project standards. |

## Installed Skills

### User-Level Skills

| Skill                | Directory                                       | Triggers                                                                |
| -------------------- | ----------------------------------------------- | ----------------------------------------------------------------------- |
| adapt                | `.claude/skills/adapt/`                         | Adapt designs across screen sizes, devices, contexts                    |
| animate              | `.claude/skills/animate/`                       | Add purposeful animations, micro-interactions, motion                   |
| audit                | `.claude/skills/audit/`                         | Full interface quality audit (accessibility, perf, theming, responsive) |
| bolder               | `.claude/skills/bolder/`                        | Amplify safe/boring designs, increase visual impact                     |
| branch-pr            | `.config/opencode/skills/branch-pr/`            | PR creation workflow, issue-first enforcement                           |
| chained-pr           | `.config/opencode/skills/chained-pr/`           | Split large PRs into chained/stacked PRs, 400-line budget               |
| clarify              | `.claude/skills/clarify/`                       | Improve UX copy, error messages, microcopy, labels                      |
| cognitive-doc-design | `.config/opencode/skills/cognitive-doc-design/` | Documentation that reduces cognitive load                               |
| colorize             | `.claude/skills/colorize/`                      | Add strategic color to monochromatic interfaces                         |
| comment-writer       | `.config/opencode/skills/comment-writer/`       | Write warm, human PR/issue/chat comments                                |
| critique             | `.claude/skills/critique/`                      | UX design evaluation, actionable feedback                               |
| delight              | `.claude/skills/delight/`                       | Add moments of joy, personality, unexpected touches                     |
| distill              | `.claude/skills/distill/`                       | Strip designs to essence, remove unnecessary complexity                 |
| extract              | `.claude/skills/extract/`                       | Extract reusable components, design tokens, patterns                    |
| frontend-design      | `.claude/skills/frontend-design/`               | Production-grade frontend interfaces, high design quality               |
| go-testing           | `.config/opencode/skills/go-testing/`           | Go testing patterns, Bubbletea TUI testing                              |
| harden               | `.claude/skills/harden/`                        | Improve resilience: error handling, i18n, edge cases                    |
| issue-creation       | `.config/opencode/skills/issue-creation/`       | GitHub issue creation, bug reports, feature requests                    |
| judgment-day         | `.config/opencode/skills/judgment-day/`         | Parallel adversarial review, dual blind judges                          |
| normalize            | `.claude/skills/normalize/`                     | Normalize design to match design system                                 |
| onboard              | `.claude/skills/onboard/`                       | Design onboarding flows, empty states, first-time UX                    |
| optimize             | `.claude/skills/optimize/`                      | Improve interface performance: loading, rendering, bundle               |
| polish               | `.claude/skills/polish/`                        | Final quality pass: alignment, spacing, consistency                     |
| quieter              | `.claude/skills/quieter/`                       | Reduce visual intensity, tone down bold designs                         |
| skill-creator        | `.config/opencode/skills/skill-creator/`        | Create new AI agent skills following spec                               |
| teach-impeccable     | `.claude/skills/teach-impeccable/`              | One-time design context setup, persistent guidelines                    |
| work-unit-commits    | `.config/opencode/skills/work-unit-commits/`    | Structure commits as deliverable work units                             |

### Project-Level Skills

| Skill         | Directory                         | Triggers                                                                            | Description                                                                                                                                                                                                                          |
| ------------- | --------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| smart-connect | `.atl/skill-registry.md` (inline) | architecture, design, security, testing, rag, best-practices, standards, convention | Comprehensive guidelines for SmartConnect project development including architecture (Clean, Screaming), testing (Jest + RTL), security (OWASP, JWT, RLS), RAG chatbot, and environment compatibility (globalThis, import.meta.env). |

## Compact Rules (smart-connect)

Inyectado por el orchestrator como `## Project Standards (auto-resolved)` en sub-agentes.

### SDD Enforcement Threshold ⚠️

Regla obligatoria para el Gentle-Orchestrator: determina cuándo DEBE usar SDD vs editar inline.

- **1-3 archivos, cambio puramente mecánico** (rename de prop, fix de import, agregar atributo): ✅ inline permitido
- **4+ archivos O cualquier cambio con lógica nueva** (refactor, estilos nuevos, comportamientos): ❌ **DEBE** usar `/sdd-new` → pipeline SDD completo
- **2+ feature directories afectados** (ej. `landing/` + `chatbot/`): ❌ DEBE usar SDD
- **Batch de fixes de audit**: siempre wrappear en un change con nombre vía `/sdd-new`
- **Duda**: si no estás seguro, usa SDD. Mejor sobre-ingeniería de proceso que cambios huérfanos.

### Architecture

- **Clean Architecture**: Presentation / Domain / Data layers, strict dependency direction (Data → Domain → Presentation)
- **DI containers** for dependency injection
- **Single Responsibility**: cada componente hace una sola cosa

### Stack

- React 18.3.1 + Vite 8.0.12 + TypeScript 5.9.3
- Tailwind CSS 4.3.0 (sintaxis: `@import "tailwindcss"`, NO directivas `@tailwind`)
- Supabase 2.105.4 (PostgreSQL + pgvector)
- **Database project**: `smartconnect-rag` (`tysjedvujvsmrzzrmesr`, eu-west-1)
  - Tables: `documents` (RAG with embeddings), `security_logs`, `app_settings` (n8n webhook, email, WhatsApp)
  - Edge Functions: `gemini-embedding`, `gemini-generate`, `chat-with-rag`
  - ⚠️ `multi_tienda` is a SEPARATE project for QRIBAR digital menu, NOT the frontend DB
- Gemini API 1.44.0 para AI
- DOMPurify 3.4.2 para sanitización

### Testing

- **Jest 29.7.0 + @testing-library/react 14.3.1**
- **Selectores semánticos**: `getByRole`, `getByLabelText`, `getByText`
- **Patrón AAA** (Arrange, Act, Assert)
- **Coverage mínimo**: 80%

### Security (OWASP)

- **Access Control**: validar roles, prevenir IDOR
- **XSS**: sanitizar con DOMPurify, NO renderizar HTML sin sanitizar
- **Auth**: JWT + Row-Level Security (RLS) en Supabase
- **Edge Functions**: validar tokens en cada función
- **NO** importar librerías Node.js (`jsdom`, `fs`, `path`) en `src/`

### Environment

- Preferir `globalThis` sobre `window`
- Usar `import.meta.env` en vez de `process.env`

### RAG Chatbot

- Embeddings: `gemini-embedding-001` → pgvector
- Búsqueda: similarity search en Supabase
- Respuesta: `gemini-2.5-flash` con contexto
- Cache: TTL 7 días

### SSR / Hydration (CRITICAL) ⚠️

Reglas para evitar React error #418 (hydration mismatch) con SSG custom (react-dom/server).

- **Tree must match**: `entry-server.tsx` y `entry-client.tsx` deben tener la MISMA estructura de componentes. Cada wrapper en el cliente debe estar también en el servidor.
- **Suspense**: `renderToString()` en React 18 no soporta Suspense nativamente pero renderiza a través del boundary. Incluí `<Suspense>` en AMBOS trees aunque no haga nada en SSR — el cliente necesita encontrarlo durante la hidratación.
- **ScrollToTop y null components**: Componentes que retornan `null` (como `ScrollToTop`) cuentan como elementos estructurales. Si están en el cliente, deben estar en el servidor también.
- **No lazy() en landing routes**: Los componentes de landing (Hero, Features, Contact, SuccessStats, ExpertAssistant) deben ser eager imports en App.tsx. `renderToString` CRASHEA con lazy() + Suspense.
- **Verificación**: El HTML prerenderizado debe tener `<!--$-->` (Suspense SSR marker). Usá `grep '<!--$-->' dist/index.html` para confirmar.

### Theme SSR Safety (CRITICAL) ⚠️

- `useState(getInitialTheme)` se ejecuta DURANTE la hidratación del cliente. Debe retornar el MISMO valor que en SSR, o componentes que renderizan JSX distinto según el tema (ej. Navbar con SVG de luna/sol) causarán error #418.
- **NUNCA** uses `matchMedia()` o `localStorage.getItem()` directamente en `getInitialTheme()` — en SSR `typeof window === "undefined"` retorna "dark", pero en el cliente `matchMedia` puede retornar "light", causando mismatch.
- **Fix**: Leé del `<html>` class que el inline script ya seteó antes de React hydrate: `document.documentElement.classList.contains("light") ? "light" : "dark"`.
- **Post-hydration**: En un `useEffect` de mount, verificá `localStorage` para restaurar la preferencia guardada sin causar crash.

### Supabase Client Proxy (CRITICAL) ⚠️

El lazy Proxy para `supabase` difiere `createClient()` hasta el primer acceso para evitar crashes en SSR cuando no hay `.env`.

```typescript
export const supabase = new Proxy<SupabaseClient>({} as SupabaseClient, {
  get(_, prop) {
    const client = getClient();
    if (prop === "then") return undefined; // evitar que sea tratado como Promise
    const value = (client as unknown as Record<string, unknown>)[
      prop as string
    ];
    if (typeof value === "function") return value.bind(client);
    return value;
  },
});
```

Reglas:

- Usá bracket access (`client[prop]`), NO `Reflect.get(client, prop, prop)` — el tercer arg es `receiver`, no la propiedad
- Funciones deben bindearse al cliente: `value.bind(client)` para mantener el `this` correcto
- `prop === "then"` debe retornar `undefined` para evitar que el Proxy sea tratado como thenable/Promise

See also: [SmartConnect Standards](.atl/smart-connect-standards.md) for full documentation.

## SDD Skills (Managed by SDD Orchestrator)

| Skill       | Path                                               |
| ----------- | -------------------------------------------------- |
| sdd-init    | `.config/opencode/skills/sdd-init/`                |
| sdd-explore | `.config/opencode/skills/sdd-explore/`             |
| sdd-propose | `.config/opencode/skills/sdd-propose/`             |
| sdd-spec    | `.config/opencode/skills/sdd-spec/`                |
| sdd-design  | `.config/opencode/skills/sdd-design/`              |
| sdd-tasks   | `.config/opencode/skills/sdd-tasks/`               |
| sdd-apply   | `.config/opencode/skills/sdd-apply/`               |
| sdd-verify  | `.config/opencode/skills/sdd-verify/`              |
| sdd-archive | `.config/opencode/skills/sdd-archive/`             |
| sdd-onboard | `.config/opencode/skills/sdd-onboard/`             |
| \_shared    | `.config/opencode/skills/_shared/` (internal refs) |
