# Contact Form n8n Toggle + Brevo Email Fallback — SDD Change Audit

**Date**: 2026-08-10
**Author**: SDD Pipeline (sdd-apply agent)
**Change**: `contact-form-n8n-toggle`
**Status**: Code-complete, delivered as 4 chained PR slices (uncommitted working tree at end of PR4 — commits left for the user to split)

---

## Objective

Add an admin-controlled toggle (`n8nEnabled`) that lets lead submissions from the landing contact form route to either the existing n8n webhook or a new Brevo-backed email fallback, without a page reload or redeploy. Triggered by n8n being intermittently unavailable in production and by the discovery of a silent fake-success bug in the existing webhook path.

---

## Delivery Strategy

Resolved as chained PRs (`stacked-to-main`), 4 work units, due to a High 400-line review-budget forecast for the combined change (~1300-1800 estimated changed lines).

| PR | Unit | Scope | Status |
|---|---|---|---|
| PR1 | Settings foundation | Migration, `Settings` entity, `settingsSchema`, `ISettingsRepository`, `SupabaseSettingsRepository`, `UpdateSettingsUseCase`, `settingsService` | Done |
| PR2 | `notify-lead` Edge Function | `_lib.ts` (pure helpers), `index.ts` (Deno entrypoint), `config.toml` registration | Done (code). Deploy + `BREVO_API_KEY` secret confirmed done by the user separately. |
| PR3 | Lead-delivery bypass fix + email channel wiring | `N8NWebhookDataSource` bypass removal, `EmailNotifyDataSource`, `EmailLeadRepositoryImpl`, `LandingContainer` singleton removal, `Contact.tsx` wiring | Done |
| PR4 | SettingsPanel UI + docs + final gates | Toggle UI, ADR, CHANGELOG, this audit entry, doc updates, full-repo verification | Done (this batch) |

---

## PR4 Summary — SettingsPanel UI + Docs + Gates

### Code changes

- `src/features/admin/presentation/components/SettingsPanel.tsx`:
  - Added a checkbox (`id="settings-n8nEnabled"`, `register("n8nEnabled")`) with a real `<label>` ("Enviar leads a n8n"), placed above the webhook URL field inside the existing "Integración n8n" section, per design section 6.
  - Added `watch`-driven helper copy that explains both states (ON = n8n webhook, OFF = email via Brevo to the configured contact email).
  - Wired `n8nEnabled` into `defaultValues` and into `reset()` inside `loadSettings`, so the field round-trips through load/save like every other setting.
  - **Fixed a pre-existing UX bug found while satisfying the "user must see the ADR-7 error, not a silent crash" requirement**: the component had an early-return `if (error)` block that fully replaced the settings form with a generic "failed to load" message on ANY error — including a failed *save* (e.g. the n8n-toggle validation error thrown by `UpdateSettingsUseCase`). This meant the admin could never see the specific validation message, nor fix the field that caused it, because the whole form vanished. Fixed by gating the full-page error state to `error && !settings` (only real load failures) and by rendering the actual `error` message (not a hardcoded string) in the inline error banner that stays visible alongside the form.
  - Updated the panel's top subtitle text since it now also documents lead-routing, not just displayed contact data.

### Test coverage note

`SettingsPanel.tsx` is a `.tsx` file. `jest.config.js`'s `testMatch` only matches `.ts`, and `testEnvironment` is `"node"`, not `jsdom` — a pre-existing, previously-documented gap (see design doc section 7, and PR3's apply-progress). No new component test was added for the toggle; this is not a new gap introduced by this PR, it is the same heritage limitation already flagged twice in this change's design and PR3 notes. The toggle's underlying logic (schema validation, use-case transition guard, service defaulting) is already covered by existing `.ts` suites from PR1 (`settingsSchema.test.ts`, `UpdateSettingsUseCase.test.ts`, `settingsService.test.ts`).

### Verification gates (full repo, PR1+PR2+PR3+PR4 combined)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | Clean |
| `npm test` | 208/208 passing, 23 suites |
| `npm run lint` (`--max-warnings 0`) | Clean, 0 warnings |
| `rg -n "placeholder-webhook\|your_\|\.invalid" src/` | 1 hit — a doc-comment in `N8NWebhookDataSource.ts` explaining why `.invalid` is deliberately not string-matched. Zero functional hits. |

### Documentation delivered

- `docs/adr/ADR-006-n8n-toggle-email-fallback.md` — new ADR documenting the toggle decision, the Strategy pattern in the DI container, the singleton removal, the choice of Brevo, and the fake-success fix. Indexed in `docs/adr/README.md`.
- `CHANGELOG.md` — `[Unreleased]` gained an `Added` entry (n8n toggle, `notify-lead` function) and a `Fixed` entry (fake-success bug, stale singleton, SettingsPanel save-error UX bug).
- `docs/CONTACT_FORM_WEBHOOK.md` — new section describing the toggle and the email fallback flow.
- `docs/EDGE_FUNCTIONS_DEPLOYMENT.md` — `notify-lead` added to the documented Edge Functions list, with its `BREVO_API_KEY` secret.

---

## Outstanding Manual Items (carried, not part of PR4's code scope)

- Apply migration `supabase/migrations/20260810120000_add_n8n_enabled_to_app_settings.sql` to the live Supabase project, if not already applied (no `apply_migration` MCP tool was available during PR1's apply batch).
- Confirm the Brevo sender `info@digitalizatenerife.es` is verified in Brevo (the user reported setting `BREVO_API_KEY` already; sender verification was flagged as possibly still pending).

## Open Risk Carried From PR3 (unchanged by PR4)

The spec's "Runtime Toggle Respects Latest Settings" scenario describes a visitor already on the landing page (same tab, no reload) observing a newly-saved `n8nEnabled` value. `Contact.tsx` fetches settings once on mount and does not poll or refetch. The `LandingContainer` singleton bug that would have made this WORSE (stale container even across reloads) was fixed in PR3, but true same-tab-without-reload propagation was never in scope for any of the 4 units and remains unaddressed. `Contact.tsx` has no executable Jest coverage under the current config, so this cannot be proven or disproven by an automated test in this repo today. Flagged again here for `sdd-verify`.

---

## Files Changed — PR4 Only

| File | Action |
|---|---|
| `src/features/admin/presentation/components/SettingsPanel.tsx` | Modified |
| `docs/adr/ADR-006-n8n-toggle-email-fallback.md` | Created |
| `docs/adr/README.md` | Modified |
| `CHANGELOG.md` | Modified |
| `docs/CONTACT_FORM_WEBHOOK.md` | Modified |
| `docs/EDGE_FUNCTIONS_DEPLOYMENT.md` | Modified |
| `docs/audit/2026-08-10_contact-form-n8n-toggle.md` | Created (this file) |

Working tree left uncommitted per instructions — the user will split PR1-PR4 into separate commits.
