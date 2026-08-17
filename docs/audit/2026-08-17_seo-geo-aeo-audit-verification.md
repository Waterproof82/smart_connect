# SEO/GEO/AEO Audit Verification — 2026-08-17

**Timestamp:** 2026-08-17
**Trigger:** User provided a full external SEO + GEO + AEO + Search Console audit report for `digitalizatenerife.es` (dated 17 Aug 2026) and asked to apply the recommended optimizations.
**Action:** Verified every technical claim against the actual repository state and the live production site (`curl` against `https://digitalizatenerife.es/`) before touching any code. Applied only what was still real and in-scope; everything else was reported back to the user with evidence.

## Why verification came first

Project memory already flagged one prior instance (2026-08-12) of an SEO audit being partially stale relative to the actual code. Given that history, claims were re-checked rather than executed blindly.

## Findings

### Confirmed real and fixed

- **Missing `loading="lazy"` / `decoding="async"` / `width`/`height` on below-the-fold images.**
  - `CartaDigitalDemoSection.tsx` — 3 PNG screenshots, ~1 MB combined, loaded eagerly despite being in the `#demo` section (well past the hero).
  - `HowItWorks.tsx` (`/tarjetas-nfc`) — 3 step images, same issue.
  - Fix matched the existing pattern already used correctly in `TpvModuleFigure.tsx` and `CartaDigitalSolucionSection.tsx` — no new pattern introduced.

### Confirmed real, fixed via Cloudflare dashboard (not code)

- **`robots.txt` served in production ≠ `public/robots.txt` in the repo.** Cloudflare was injecting a "Managed robots.txt" block that `Disallow`ed GPTBot, ClaudeBot, Google-Extended, Amazonbot, CCBot, Bytespider, Applebot-Extended, meta-externalagent — verified via `curl https://digitalizatenerife.es/robots.txt`. The repo's own file was already clean (`Allow: /` for all of them). Root cause traced through Cloudflare's dashboard live in this session: **Domain → Robots.txt availability → `digitalizatenerife` row → "Managed robots.txt"** toggle ("When enabled, Cloudflare creates or updates your robots.txt file to signal that your content should not be used for AI training"). User disabled it. Re-verified with `curl` immediately after: production now serves the repo's own `public/robots.txt` unmodified — `Allow: /` for every AI/search crawler (GPTBot, ClaudeBot, Google-Extended, PerplexityBot, OAI-SearchBot, ChatGPT-User, Amazonbot, CCBot, Meta-ExternalAgent, Bytespider), `Disallow` only on `/admin`, `/panel`, `/login`. The site's existing `Content-Signal: ai-train=no, search=yes, use=reference` header (in `vercel.json`) already expresses the "don't train, do allow search/citation" intent without needing Cloudflare's blanket crawler block.
- Along the way, used Cloudflare's per-crawler traffic table to distinguish bots that make real HTTP requests (GPTBot, ClaudeBot — actually blocked, 401/unsuccessful logged) from bots that don't (Google-Extended — reads the `Google-Extended` token via Googlebot's existing crawl, never sends its own request, so it never appears in a traffic-based crawler table). This is why Google-Extended wasn't visible in "AI Crawl Control"'s crawler list and had to be found under the separate "Robots.txt availability" feature instead.

### Audit claims that were stale (already fixed by prior work) — verified, no action taken

- **`/servicios` "duplicate content, canonical points to `/`"** — false as of now. `git log` shows `d7ac280 "feat(seo): consolidate FAQ into one section, hardcode canonical, drop /servicios"`. `vercel.json` has a 301 redirect `/servicios → /`. Live check: `curl -I https://digitalizatenerife.es/servicios` → `308 → /`. The audit's GSC data reflects a pre-redirect crawl state.
- **`/tap-review` "needs consolidation"** — already a 301 redirect to `/tarjetas-nfc` in `vercel.json`, confirmed live (`308`).
- **`/about` "orphaned, zero internal links"** — false. `App.tsx` footer already has `<Link to="/about">Sobre Nosotros</Link>` (line ~449). GSC's "0 internal links" figure is a lagging aggregate, not current.
- **`public/llms.txt` "points to dead URLs"** — false as of this read; the file only lists `/`, `/tarjetas-nfc`, `/about`, and the 3 `/legal/*` routes, all live. No `/servicios` reference.
- **`scripts/site-routes.json` / sitemap "missing `/servicios`"** — correct that it's absent, but that's intentional: `/servicios` is a redirect, not a page, and redirects must not be in the sitemap.
- **ES/EN toggle "duplicate English nav block permanently in the DOM, no hreflang"** — `LanguageSelector.tsx` is a real controlled `<select>` that swaps translation keys via context; it does not render two language blocks simultaneously. `App.tsx` has an explicit comment recording the decision to omit `hreflang` until real `/en/` URLs exist. `llms.txt` documents the same decision. Already correct, already documented — no action needed.

### Explicitly declined by user

- Removing the "Admin" nav link — user wants it kept (protected by auth, needed for access from any device).
- Creating a new content section/page for IA/automatización/chatbots keywords — user does not want new content; scope was kept to technical SEO only.

## Files changed

- `src/features/landing/presentation/components/CartaDigitalDemoSection.tsx`
- `src/features/tap-review/presentation/components/HowItWorks.tsx`
- `CHANGELOG.md`

## Cloudflare dashboard change (not in git)

- **Domain → Robots.txt availability → `digitalizatenerife` → "Managed robots.txt"**: disabled. No longer overrides `public/robots.txt` at the edge.

## Validation

- `npm run type-check` — passed, no errors.
- `npx eslint <changed files> --max-warnings 0` — passed, no warnings.
- No `npm run build` run (per standing instruction not to build after changes).
