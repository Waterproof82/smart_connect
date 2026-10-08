import fs from "node:fs";
import path from "node:path";

// Unit 6 (rag-knowledge-base-refresh, design D14): schema migrations that
// prepare `documents` for idempotent upsert-based ingestion. These migrations
// are NOT applied by this test suite (no live DB in CI) — we assert on SQL
// *structure* the same way existing migration-adjacent fixes do, by reading
// the file content and matching the statements we rely on. The owner applies
// migrations manually; see docs/audit/2026-10-08_rag-unit6-migrations.md.
const MIGRATIONS_DIR = path.resolve(__dirname, "../../supabase/migrations");

function findMigration(pattern: RegExp): string {
  const files = fs.readdirSync(MIGRATIONS_DIR);
  const match = files.find((f) => pattern.test(f));
  if (!match) {
    throw new Error(`No migration file matches ${pattern} in ${MIGRATIONS_DIR}`);
  }
  return fs.readFileSync(path.join(MIGRATIONS_DIR, match), "utf-8");
}

describe("Unit 6 — snapshot/backup migration", () => {
  let sql: string;

  beforeAll(() => {
    sql = findMigration(/snapshot.*documents.*\.sql$/i);
  });

  it("creates the kb_backup schema", () => {
    expect(sql).toMatch(/CREATE SCHEMA IF NOT EXISTS kb_backup/i);
  });

  it("creates a NEW timestamped snapshot table, never creates or drops documents_20261007", () => {
    expect(sql).toMatch(/kb_backup\.documents_\d{8}/i);
    const executableLines = sql
      .split("\n")
      .filter((line) => !line.trim().startsWith("--") && !line.trim().startsWith("'"));
    const touchesOldSnapshot = executableLines.some((line) =>
      /documents_20261007/i.test(line),
    );
    expect(touchesOldSnapshot).toBe(false);
  });

  it("snapshot table creation is idempotent (IF NOT EXISTS)", () => {
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS kb_backup\.documents_\d{8}/i);
  });

  it("snapshots from the live documents table", () => {
    expect(sql).toMatch(/AS\s+SELECT \* FROM public\.documents/i);
  });

  it("revokes snapshot privileges from public/anon/authenticated", () => {
    expect(sql).toMatch(/REVOKE[\s\S]*FROM\s+(PUBLIC|public)/i);
    expect(sql).toMatch(/anon/i);
    expect(sql).toMatch(/authenticated/i);
  });

  it("never drops or truncates the existing documents table or documents_20261007 backup", () => {
    expect(sql).not.toMatch(/DROP TABLE[\s\S]*public\.documents\b/i);
    expect(sql).not.toMatch(/TRUNCATE[\s\S]*documents/i);
  });
});

describe("Unit 6 — content_hash, HNSW, upsert/delete RPCs, embedding_cache removal", () => {
  let sql: string;

  beforeAll(() => {
    sql = findMigration(/content_hash.*hnsw.*upsert.*rpc|kb_.*content_hash.*\.sql$/i);
  });

  it("adds content_hash column idempotently, nullable (no NOT NULL/backfill requirement)", () => {
    expect(sql).toMatch(/ALTER TABLE public\.documents[\s\S]*ADD COLUMN IF NOT EXISTS content_hash/i);
    expect(sql).not.toMatch(/content_hash[^\n,;]*NOT NULL/i);
  });

  it("adds a UNIQUE index on content_hash", () => {
    expect(sql).toMatch(/CREATE UNIQUE INDEX[\s\S]*content_hash/i);
  });

  it("drops the ivfflat index and replaces it with HNSW using extensions.vector_cosine_ops", () => {
    expect(sql).toMatch(/DROP INDEX IF EXISTS[\s\S]*documents_embedding_idx/i);
    expect(sql).toMatch(/USING hnsw \(embedding extensions\.vector_cosine_ops\)/i);
    expect(sql).not.toMatch(/USING ivfflat/i);
  });

  it("defines upsert_document granted to service_role only", () => {
    expect(sql).toMatch(/CREATE (OR REPLACE )?FUNCTION public\.upsert_document/i);
    expect(sql).toMatch(/REVOKE EXECUTE ON FUNCTION public\.upsert_document[\s\S]*FROM\s+PUBLIC,\s*anon,\s*authenticated/i);
    expect(sql).toMatch(/GRANT EXECUTE ON FUNCTION public\.upsert_document[\s\S]*TO service_role/i);
  });

  it("defines delete_stale_documents granted to service_role only and failing on empty keep_hashes", () => {
    expect(sql).toMatch(/CREATE (OR REPLACE )?FUNCTION public\.delete_stale_documents/i);
    expect(sql).toMatch(/RAISE EXCEPTION/i);
    expect(sql).toMatch(/REVOKE EXECUTE ON FUNCTION public\.delete_stale_documents[\s\S]*FROM\s+PUBLIC,\s*anon,\s*authenticated/i);
    expect(sql).toMatch(/GRANT EXECUTE ON FUNCTION public\.delete_stale_documents[\s\S]*TO service_role/i);
  });

  it("delete_stale_documents is scoped to ingestion-managed sources only (site:/faq:/curated:)", () => {
    expect(sql).toMatch(/\^\(site\|faq\|curated\):/);
  });

  it("re-creates match_documents returning metadata and re-grants anon/authenticated", () => {
    expect(sql).toMatch(/DROP FUNCTION IF EXISTS public\.match_documents\(/i);
    expect(sql).toMatch(/CREATE (OR REPLACE )?FUNCTION public\.match_documents\(/i);
    expect(sql).toMatch(/metadata\s+JSONB/i);
    expect(sql).toMatch(/GRANT EXECUTE ON FUNCTION public\.match_documents\([\s\S]*TO anon/i);
    expect(sql).toMatch(/GRANT EXECUTE ON FUNCTION public\.match_documents\([\s\S]*TO authenticated/i);
  });

  it("re-creates match_documents_by_source returning metadata and re-grants anon/authenticated", () => {
    expect(sql).toMatch(/DROP FUNCTION IF EXISTS public\.match_documents_by_source\(/i);
    expect(sql).toMatch(/CREATE (OR REPLACE )?FUNCTION public\.match_documents_by_source\(/i);
    expect(sql).toMatch(/GRANT EXECUTE ON FUNCTION public\.match_documents_by_source\([\s\S]*TO anon/i);
    expect(sql).toMatch(/GRANT EXECUTE ON FUNCTION public\.match_documents_by_source\([\s\S]*TO authenticated/i);
  });

  it("new read/write functions declare SECURITY INVOKER and pin search_path to public, extensions", () => {
    const invokerCount = (sql.match(/SECURITY INVOKER/gi) || []).length;
    expect(invokerCount).toBeGreaterThanOrEqual(4);
    const searchPathCount = (sql.match(/SET search_path = public, extensions/gi) || []).length;
    expect(searchPathCount).toBeGreaterThanOrEqual(4);
  });

  it("drops the dead embedding_cache table (CASCADE takes its trigger) and cleanup functions", () => {
    expect(sql).toMatch(/DROP TABLE IF EXISTS public\.embedding_cache CASCADE/i);
    expect(sql).toMatch(/DROP FUNCTION IF EXISTS public\.clean_expired_embedding_cache/i);
  });

  it("never runs DROP TRIGGER ... ON embedding_cache (Postgres errors when the table is already gone, as in production)", () => {
    // 2026-10-08: applying the migration to production failed with
    // `42P01 relation "public.embedding_cache" does not exist` — IF EXISTS
    // covers the trigger, not the table it is attached to.
    expect(sql).not.toMatch(/DROP TRIGGER[^;]*ON\s+public\.embedding_cache/i);
  });
});
