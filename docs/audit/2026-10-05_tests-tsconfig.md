# Tests tsconfig (2026-10-05)

- **Problem:** VS Code reported TS1192/TS1259/TS2307/TS2802 in every `tests/` file. The root `tsconfig.json` excludes `tests/**/*`, so the editor fell back to an inferred project without `esModuleInterop`, `paths` or an ES2015+ target. Jest was unaffected because `ts-jest` gets its own options.
- **Action:** added `tests/tsconfig.json`, which extends the root config and includes `tests/**/*` and `src/**/*`.
- **Surfaced errors:** `tpvModuleFigures.structure.test.ts` cast `TpvModuleTranslations` directly to `Record<string, string>`. It now casts through `unknown`.
- **Removed dead files:** `tests/setup.ts` was not referenced anywhere; `jest.config.js` uses `tests/jest.setup.ts`. The two `tests/unit/features/landing/presentation/**/Contact.test.tsx` files never ran: Jest `testMatch` only matches `.ts`, and Vitest includes only `src/`. Contact is covered by `src/features/landing/presentation/components/__tests__/Contact.test.tsx`.
- **Validation:** `npx tsc -p tests/tsconfig.json --noEmit` reports 0 errors; `tpvModuleFigures.structure.test.ts` passes 109/109; lint is clean.
