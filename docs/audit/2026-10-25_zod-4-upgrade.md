# zod 3 -> 4 upgrade (Snyk SNYK-JS-ZOD-20510278)

**Timestamp:** 2026-10-25 11:30 UTC
**Type:** fix (security dependency), TDD

## Finding
`.snyk` ignored SNYK-JS-ZOD-20510278 until 2026-11-05 because no fixed version existed. Snyk now lists it as vulnerable `< 4.6.6`, fixed in 4.6.6 (checked 2026-10-25). The direct dependency was zod 3.25.76 (no 3.x fix); `@vercel/functions > @vercel/oidc > @vercel/cli-config` pinned zod 4.1.11.

## Actions
- New `src/__tests__/formSchemas.test.tsx` (Vitest, jsdom for DOMPurify): characterization of `contactSchema`, `loginSchema`, `settingsSchema` — valid input, per-field Spanish messages, injection/length refinements, n8n cross-field rule. 9/9 on zod 3 before the upgrade.
- `package.json`: `zod` `^3.22.4` → `^4.6.7`; `overrides.zod = "$zod"` so every copy resolves to 4.6.7 (`npm ls zod`: single 4.6.7).
- `settingsSchema.ts`: `z.ZodIssueCode.custom` (deprecated in v4) → `"custom"`.
- `.snyk`: ignore removed.

## Validation
- `formSchemas.test.tsx` 9/9 on zod 4; `npx tsc --noEmit`, `npm run lint`, `npx knip`: pass; Jest 1786 passed; Vitest 50 files / 274 tests.
- CI runs Snyk on push; result checked after merge.
