/**
 * supabaseClient.ts / supabaseClientSync.ts — structure tests.
 *
 * Behavioral testing of the real `supabaseClient.ts` module is not
 * possible under this repo's ts-jest config: a file that combines
 * `import.meta.env` access with an `@supabase/supabase-js` import breaks
 * ts-jest's transform (confirmed via a minimal repro — every existing
 * consumer test in this codebase mocks `@shared/supabaseClient` instead
 * of loading the real module, which is why this was never hit before).
 * The actual memoize/retry LOGIC lives in the fully unit-tested, plain
 * `@shared/utils/memoizeAsync` (see memoizeAsync.test.ts) — this file
 * only verifies `supabaseClient.ts` wires it correctly and keeps the
 * dynamic `import()` strictly inside an async function body (never at
 * module scope / component render), per design.md's SSR-parity rule.
 */

import fs from "node:fs";
import path from "node:path";

const SRC = path.resolve(__dirname, "../../../src/shared");
const ASYNC_PATH = path.join(SRC, "supabaseClient.ts");
const SYNC_PATH = path.join(SRC, "supabaseClientSync.ts");

describe("supabaseClient.ts (async chokepoint)", () => {
  const source = fs.readFileSync(ASYNC_PATH, "utf-8");

  it("does NOT statically import createClient from @supabase/supabase-js", () => {
    expect(source).not.toMatch(
      /import\s*\{[^}]*createClient[^}]*\}\s*from\s*["']@supabase\/supabase-js["']/,
    );
  });

  it("only type-imports SupabaseClient from @supabase/supabase-js (no runtime static edge)", () => {
    expect(source).toMatch(
      /import\s+type\s*\{[^}]*SupabaseClient[^}]*\}\s*from\s*["']@supabase\/supabase-js["']/,
    );
  });

  it("dynamically imports @supabase/supabase-js", () => {
    expect(source).toMatch(
      /await\s+import\(\s*["']@supabase\/supabase-js["']\s*\)/,
    );
  });

  it("the dynamic import line is indented (nested inside a function body, not at module top level)", () => {
    const lines = source.split("\n");
    const importLine = lines.find((line) =>
      /await\s+import\(\s*["']@supabase\/supabase-js["']\s*\)/.test(line),
    );
    expect(importLine).toBeDefined();
    expect(importLine).toMatch(/^\s+\S/); // leading whitespace = nested, not column 0

    // And there is an `async function` declared before it in the file.
    const importIndex = source.indexOf(importLine!);
    const precedingCode = source.slice(0, importIndex);
    expect(precedingCode).toMatch(/async function\s+\w+/);
  });

  it("composes memoizeAsync from @shared/utils/memoizeAsync", () => {
    expect(source).toMatch(
      /import\s*\{\s*memoizeAsync\s*\}\s*from\s*["']@shared\/utils\/memoizeAsync["']|from ["']\.\/utils\/memoizeAsync["']/,
    );
    expect(source).toMatch(/memoizeAsync\(/);
  });

  it("exports an async getSupabase function", () => {
    expect(source).toMatch(/export\s+const\s+getSupabase\s*[:=]/);
  });

  it("no longer exports the sync Proxy-based `supabase` const (moved to supabaseClientSync.ts)", () => {
    expect(source).not.toMatch(/export\s+const\s+supabase\s*=/);
  });
});

describe("supabaseClientSync.ts (sync Proxy — admin-only consumers)", () => {
  it("exists and exports the lazy Proxy-based supabase client", () => {
    expect(fs.existsSync(SYNC_PATH)).toBe(true);
    const source = fs.readFileSync(SYNC_PATH, "utf-8");
    expect(source).toMatch(/export\s+const\s+supabase\s*=\s*new\s+Proxy/);
    expect(source).toMatch(
      /import\s*\{[^}]*createClient[^}]*\}\s*from\s*["']@supabase\/supabase-js["']/,
    );
  });
});
