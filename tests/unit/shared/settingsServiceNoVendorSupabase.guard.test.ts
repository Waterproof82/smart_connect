import fs from "node:fs";
import path from "node:path";

/**
 * Guard: keeps `vendor-supabase` out of the public-page settings-read
 * path (S5, SDD `landing-main-thread-tbt`). `settingsService.ts` now
 * reads `app_settings` via a plain PostgREST `fetch`; it — and every
 * public entry point that (transitively) reaches it for the WhatsApp
 * phone / contact settings — must have no source reference to
 * `@supabase/supabase-js`, `getSupabase`, `@shared/supabaseClient` or the
 * admin-only `supabaseClientSync`.
 *
 * Deviation from the literal tasks.md T5.8 path
 * (`tests/unit/shared/services/settingsServiceNoVendorSupabase.guard.test.ts`):
 * this repo has no `tests/unit/shared/services/` directory — every other
 * `settingsService`-adjacent test lives directly under `tests/unit/shared/`
 * (see `settingsService.test.ts`). Filed here to match that convention,
 * same precedent as earlier slices' file-path deviations.
 *
 * Scope note: this is a source-text scan of the explicit entry points
 * named for this slice, not a generic transitive import-graph walker.
 * `ExpertAssistantWithRAG.tsx`/`ChatbotContainer`'s own lazy-on-first-open
 * use of `getSupabase()` for the RAG backend is a SEPARATE, intentional
 * concern (verified by reading the code, not by this guard — see the
 * apply-progress report) and is explicitly NOT in this list.
 */
const SRC = path.resolve(__dirname, "../../../src");

const GUARDED_FILES = [
  "shared/services/settingsService.ts",
  "shared/hooks/useWhatsappPhone.ts",
  "shared/presentation/layout/WhatsAppCta.tsx",
  "features/landing/presentation/components/Contact.tsx",
  "features/chatbot/presentation/DeferredExpertAssistant.tsx",
];

const FORBIDDEN_PATTERNS = [
  /@supabase\/supabase-js/,
  /getSupabase/,
  /@shared\/supabaseClient/,
  /supabaseClientSync/,
];

/**
 * Strips `/* block *\/` and `// line` comments before scanning. Several of
 * the guarded files' own module docs deliberately NAME the forbidden
 * identifiers in prose (explaining what NOT to reintroduce) — only real
 * code (imports, calls) should fail this guard.
 */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

describe("settings-reader path stays free of vendor-supabase", () => {
  it.each(GUARDED_FILES)("%s has no Supabase SDK reference", (relativePath) => {
    const fullPath = path.join(SRC, relativePath);
    const source = stripComments(fs.readFileSync(fullPath, "utf-8"));

    const matches = FORBIDDEN_PATTERNS.filter((pattern) => pattern.test(source));

    expect(matches.map((pattern) => pattern.source)).toEqual([]);
  });
});
