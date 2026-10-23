import fs from "node:fs";
import path from "node:path";

// supabase-schema-hygiene (PR1, design c.1-3): the local `supabase/migrations`
// directory must mirror remote `schema_migrations` exactly — no drift, no
// obsolete files. There is no live DB in CI, so this test asserts on the
// file set itself (names + versions), the same way other migration-adjacent
// guard tests do (see kbSchemaMigration.structure.test.ts).
const MIGRATIONS_DIR = path.resolve(__dirname, "../../supabase/migrations");

const FILENAME_PATTERN = /^\d{14}_[a-z0-9_]+\.sql$/;

// Snapshot of remote `schema_migrations.version` as of 2026-10-23, captured
// by the orchestrator against the live Supabase project. Subset check (not
// exact equality) so future migrations don't break this guard.
const APPLIED_VERSIONS = [
  "20260129120000",
  "20260129121000",
  "20260129130000",
  "20260129131000",
  "20260129140000",
  "20260204000000",
  "20260204100000",
  "20260204110000",
  "20260204120000",
  "20260204130000",
  "20260218000000",
  "20260218090000",
  "20260218100000",
  "20260218140000",
  "20260218150000",
  "20260218160000",
  "20260218170000",
  "20260218180000",
  "20260218190000",
  "20260219000000",
  "20260219100000",
  "20260219110000",
  "20260219120000",
  "20260219130000",
  "20260219140000",
  "20260219150000",
  "20260219160000",
  "20260309000002",
  "20260309073550",
  "20260309073628",
  "20260309121822",
  "20260309140223",
  "20260516163904",
  "20260516163914",
  "20260516163925",
  "20260527184851",
  "20260810184815",
  "20260810194044",
  "20260810195508",
  "20261006100000",
  "20261008065303",
  "20261008065448",
  "20261008075727",
  "20261009071321",
  // Bookkeeping-only: effect already live, recorded without re-execution
  // (design b) by the orchestrator right after PR1 merges.
  "20260309000003",
];

// The 6 old placeholder/incorrect-timestamp versions this PR renames away
// from (design d) — must never reappear locally.
const RENAMED_AWAY_VERSIONS = [
  "20260309000000",
  "20260309000001",
  "20260309100000",
  "20260810120000",
  "20260810130000",
  "20260810131500",
];

// Never applied; column it would have added is not used anywhere (spec:
// Obsolete Migration Removal).
const OBSOLETE_VERSION = "20260510132727";

function listMigrationFiles(): string[] {
  return fs.readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith(".sql"));
}

function extractVersion(filename: string): string {
  return filename.slice(0, 14);
}

describe("supabase migration history — structure (PR1 drift repair)", () => {
  let files: string[];
  let versions: string[];

  beforeAll(() => {
    files = listMigrationFiles();
    versions = files.map(extractVersion);
  });

  it("every migration filename matches the 14-digit-version + snake_case pattern", () => {
    const offenders = files.filter((f) => !FILENAME_PATTERN.test(f));
    expect(offenders).toEqual([]);
  });

  it("no two migration filenames share the same 14-digit version prefix", () => {
    const duplicates = versions.filter(
      (v, i) => versions.indexOf(v) !== i,
    );
    expect(Array.from(new Set(duplicates))).toEqual([]);
  });

  it("the obsolete never-applied migration is absent", () => {
    expect(versions).not.toContain(OBSOLETE_VERSION);
  });

  it("never introduces the event_type column (obsolete migration's only effect)", () => {
    const touchesEventType = files.some((f) => {
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, f), "utf-8");
      return /event_type/i.test(sql);
    });
    expect(touchesEventType).toBe(false);
  });

  it("the 6 renamed-away placeholder-timestamp versions are absent", () => {
    for (const old of RENAMED_AWAY_VERSIONS) {
      expect(versions).not.toContain(old);
    }
  });

  it("every remote APPLIED_VERSION has a local file (subset check)", () => {
    const missing = APPLIED_VERSIONS.filter((v) => !versions.includes(v));
    expect(missing).toEqual([]);
  });
});
