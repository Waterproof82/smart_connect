# Audit — notify-lead single entry point + anti-bot signals

**Timestamp:** 2026-10-08
**Trigger:** SDD change `notify-lead-antibot` — `app_settings.n8n_webhook_url` was anon-readable (live-verified 2026-10-08), so any bot could POST straight to the n8n webhook with no validation, rate limit or origin check. `notify-lead` itself had no bot filter, and its in-memory rate limiter only lives per-isolate. Preventive change: 0 abusive invocations observed in the 24h preceding the change.

## Scope

Three chained PRs, each gated on `npx tsc --noEmit`, `npm run lint`, `npm test` (Jest) and `npx vitest run` passing before commit. Strict TDD throughout (RED test written first for every new pure function). `npm run build` was not run locally, per the owner's standing "never build after changes" rule — deferred to CI.

Out of scope (deferred, with an explicit trigger — per the proposal): a persistent Postgres rate limit (hashed+peppered IP; trigger: observed abuse or >20 notify-lead calls/day) and Cloudflare Turnstile (trigger: abuse gets past the honeypot/fill-time layer). The existing origin allow-list is unchanged (defense-in-depth, not a bot blocker on its own).

## Branches / commits

### PR1 — `feat/notify-lead-single-entry` (base `develop`)

1. `feat(notify-lead): single server-side lead entry point` — `_lib.ts` gained `resolveLeadRouting` (routing decision from the `app_settings` row: n8n URL surfaced only when `n8n_enabled === true` AND the URL is a well-formed `https:` URL — strict boolean, no truthy coercion) and `buildN8nPayload` (keeps the legacy Spanish-key shape the external n8n workflow expects). `index.ts` now reads `contact_email,n8n_enabled,n8n_webhook_url` with the **service role** (previously anon), forwards to n8n server-side with a 5s `AbortController` timeout, and falls back to Brevo on ANY n8n failure (invalid URL, non-2xx, timeout, network error) so a lead is never lost. Also dropped the `ip|email` rate-limit warning log (PII) and added PII-free `delivered channel=`/`n8n_fallback reason=` log lines. Backward compatible with the (still n8n-unaware) client shipped before this change.
   - Verification: `npx jest supabase/functions/notify-lead/_lib.test.ts` (39 tests, including 11 new RED→GREEN for `resolveLeadRouting`/`buildN8nPayload`), `npx tsc --noEmit`, `npm run lint`.

### PR2 — `feat/notify-lead-client-and-grants` (base = PR1 branch)

2. `feat(landing): route every lead through notify-lead, drop anon n8n read` —
   - New migration `supabase/migrations/20261009071321_app_settings_anon_column_grants.sql` (file only — **owner applies it**, see Owner Actions): revokes table-level anon `SELECT` on `app_settings` and grants column-level `SELECT (id, contact_email, whatsapp_phone, physical_address)`. `n8n_enabled`/`n8n_webhook_url` are deliberately excluded.
   - `settingsService.ts` switched from `select=*` (fails under column-level grants) to the explicit public column list; `AppSettings` drops `n8nWebhookUrl`/`n8nEnabled`. A new regression test (`NEVER uses a wildcard select`) guards against reverting to `select=*`.
   - The browser's n8n branch is deleted: `N8NWebhookDataSource.ts`, `LeadRepositoryImpl.ts`, `EmailLeadRepositoryImpl.ts` removed; `EmailNotifyDataSource`→`NotifyLeadDataSource`, `EmailLeadRepositoryImpl`→`NotifyLeadRepositoryImpl` (renamed via `git mv`, tests renamed with them). `LandingContainer` no longer takes a config or exposes `leadChannel` — it always wires `NotifyLeadDataSource → NotifyLeadRepositoryImpl → SubmitLeadUseCase`. `LeadEntity.toWebhookPayload` (dead code, zero callers) removed. `Contact.tsx` builds the container with `useMemo(() => createLandingContainer(), [])` and no longer gates the submit button on `isLoadingSettings` (the container never depended on settings).
   - Verification: `npx jest tests/unit/shared/settingsService.test.ts tests/unit/features/landing/...` (data/domain/presentation layers), `npx vitest run` (`Contact.test.tsx`, `useWhatsappPhone.test.tsx`), `npx tsc --noEmit`, `npm run lint`.

### PR3 — `feat/notify-lead-antibot-signals` (base = PR2 branch)

3. `feat(notify-lead): honeypot + fill-time anti-bot signals` —
   - `_lib.ts` gained `evaluateBotSignals(body, { requireSignals, minFillMs? })`: honeypot (`website` field) wins over fill-time when both fire; a present-but-wrong-typed `website` (number/boolean/object) is treated as suspicious and counted as filled; an **entirely absent** `website` key is NOT treated as filled (keeps a stale cached pre-PR3 client from being silently rejected). `elapsedMs` present-but-non-finite or `< MIN_FILL_MS` (3000ms, including negative) → `too_fast`; absent → `missing_signals` only when `NOTIFY_LEAD_REQUIRE_ANTIBOT_SIGNALS=true` (tolerant/default: allowed through). 16 new RED tests, all GREEN after implementation.
   - `index.ts` wires `evaluateBotSignals` right after payload validation and BEFORE the rate limiter (a bot never consumes a rate-limit slot). Rejection is always a `{ ok: true }` 200 (indistinguishable from success to a scraping bot) with a PII-free `bot_rejected reason=` log line — no delivery attempt.
   - Domain: new `LeadSubmissionMeta { website, elapsedMs }` (transport context, deliberately NOT merged into the `Lead` entity). `ILeadRepository.submitLead` / `SubmitLeadUseCase.execute` accept an optional `meta` second parameter. `NotifyLeadRepositoryImpl` only attaches `website`/`elapsedMs` to the wire payload when `meta` was supplied (omits the keys entirely otherwise, rather than sending `undefined`).
   - `Contact.tsx`: hidden honeypot input (`name="website"`, `id="contact-website"`, `autoComplete="off"`, `tabIndex={-1}`, wrapper `aria-hidden="true"` + absolute/overflow-hidden positioning — explicitly NOT `display:none`, since some bot scripts skip `display:none` fields, which would defeat the honeypot). Read uncontrolled via `ref`, never registered in the zod schema. `startedAt` is stamped with `performance.now()` inside a `useEffect` on mount (never during render — SSR-safe); `elapsedMs` is computed at submit time and sent even when it's exactly `0` (falsy-but-valid, not omitted).
   - Verification: `npx jest` (55 `_lib.test.ts` cases, repository meta-passthrough tests including the 0ms case), `npx vitest run` (`Contact.test.tsx`: hidden-field attributes, numeric/finite `elapsedMs`, 0ms-not-dropped), `npx tsc --noEmit`, `npm run lint`.
4. `docs: changelog and audit log` — this file + `CHANGELOG.md` `[Unreleased]` entries.

## Reconciliation note (spec vs. owner decision)

The spec's "missing or invalid timestamp → always allow" scenario is scoped to **tolerant mode only** (the default). The owner decided strict mode (`NOTIFY_LEAD_REQUIRE_ANTIBOT_SIGNALS=true`, flipped roughly 48h after the client ships) rejects a missing/invalid `elapsedMs` as `missing_signals`. Honeypot-filled or `elapsedMs < 3000` reject silently in **both** modes. This audit and the design doc reflect the owner decision as the source of truth.

## Deviation note (honeypot-absent handling)

The design's literal interface comment for the honeypot check reads "non-string OR trimmed length>0 → honeypot," which taken literally would also flag an entirely **absent** `website` key (its value is `undefined`, which is non-string) as bot-filled. That would silently reject every lead from a stale cached client bundle built before this field existed — directly contradicting D11's explicit rationale ("cached old bundles must not lose a lead"). The implementation treats an absent key as "no signal" (falls through to the `elapsedMs` check) and reserves the "non-string → honeypot" branch for a key that IS present but holds the wrong type (number/boolean/object — a sign of a crafted/malformed request). This is called out here rather than silently diverging from the design doc.

## Verification (every commit, both Jest and Vitest)

- `npm test` (Jest): 143 suites green throughout; 1816 → 1835 tests (net +19: 16 `evaluateBotSignals` cases, 3 `NotifyLeadRepositoryImpl` meta-passthrough cases, offset by test renames/consolidation elsewhere).
- `npx vitest run`: 33 files, 183 → 187 tests (net +4 anti-bot/honeypot cases in `Contact.test.tsx`).
- `npx tsc --noEmit`: clean after every commit.
- `npm run lint`: clean after every commit (0 warnings, `--max-warnings 0`).

## Owner Actions (NOT done by this change — explicitly out of scope for `sdd-apply`)

- **PR1**: deploy the `notify-lead` Edge Function; confirm production still delivers leads (client is unchanged by PR1).
- **PR2**: after merge, confirm the browser no longer issues any request to the n8n host (DevTools/Network) — THEN apply `supabase/migrations/20261009071321_app_settings_anon_column_grants.sql` via the Supabase CLI/dashboard; verify `has_column_privilege('anon','public.app_settings','n8n_webhook_url','SELECT') = false`, `contact_email` = true, `has_table_privilege('authenticated','public.app_settings','SELECT') = true`; REST sanity check (anon `select=n8n_webhook_url` → 401/42501, explicit column list → 200); confirm the admin panel still loads every column; **rotate the n8n webhook path** and update it in the admin settings (the old path was anon-readable up to this point).
- **PR3**: deploy `notify-lead` again (now anti-bot aware); monitor logs for ~48h (no `bot_rejected reason=missing_signals` spikes expected while tolerant); then flip `NOTIFY_LEAD_REQUIRE_ANTIBOT_SIGNALS=true` as a secret (no redeploy required).

## Review workload note

Three stacked PRs, `stacked-to-main` chain strategy (per `sdd-tasks`' Review Workload Forecast — `400-line budget risk: Low` per PR). Estimated ~120 / ~220 (deletion-heavy) / ~180 changed lines respectively, all under the 400-line reviewer budget.

## 2026-10-09T07:13Z — PR2 rollout

- PR #146 merged to develop, promoted to main (7d38249); Vercel production deploy and main CI green. Live bundle verified: settings read uses the explicit column list, no `select=*`, no `n8n_webhook_url`.
- Migration applied via Supabase MCP (remote version `20261009071321`; local file renamed to match, not via `db push` because of pre-existing local-only migrations). Verified: anon `n8n_webhook_url`/`n8n_enabled` = false, public columns = true, authenticated still reads the webhook; REST as anon → public columns 200, `select=n8n_webhook_url` and `select=*` → 42501; live page still renders the contact email.
- PR1 smoke test: real lead from production form delivered via Brevo (`notify-lead: delivered channel=brevo`, no PII in log); owner confirmed email received.

## 2026-10-09T07:45Z — Hotfix: honeypot dropped a real lead (Chrome autofill)

- **Incident**: after PR3 went live, the owner's real test submission was rejected silently (`notify-lead: bot_rejected reason=honeypot`). Owner confirmed Chrome + autofill. Root cause: Chrome ignores `autocomplete="off"` and its heuristics filled the hidden input named `website`. The design assumed `autocomplete="off"` was enough — never verified against real Chrome behavior.
- **Fix (branch `fix/honeypot-chrome-autofill`, TDD)**:
  - `Contact.tsx`: honeypot `name`/`id` → `sc_hp_field` / `contact-sc-hp` (matches no autofill heuristic) + `data-lpignore`, `data-1p-ignore`, `data-bwignore`, `data-form-type="other"`. Payload key stays `website`, so the server contract is unchanged.
  - `_lib.ts` `evaluateBotSignals`: a filled string honeypot no longer rejects on its own. With `elapsedMs >= 3000` (or missing in tolerant mode) → `{ isBot: false, suspect: true }`; filled + too fast → reject `honeypot`; non-string honeypot → reject; strict mode + missing timing → reject `missing_signals`.
  - `index.ts`: suspect leads are delivered (`notify-lead: suspect_delivered reason=honeypot`, no PII) and the Brevo subject gets a `[Posible spam] ` prefix.
- **Deploy order**: deploy `notify-lead` first (stops the silent drops immediately, also for cached old bundles), then promote the client.
