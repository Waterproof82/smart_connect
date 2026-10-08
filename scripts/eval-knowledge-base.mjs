#!/usr/bin/env node
/**
 * Grounded-answer evaluation runner for the chat-with-rag knowledge base
 * (design.md rag-knowledge-base-refresh Unit 8; spec `chatbot-rag` —
 * "Grounded Answer Evaluation Set"). Pure injectable core (`runEval`) + a
 * thin CLI entry. Run manually via `npm run eval-kb` AFTER ingestion has
 * completed — it makes real network calls against the DEPLOYED
 * `chat-with-rag` function and must never run unattended/automatically.
 *
 * Exits non-zero if the pass rate is below 90% or any `mustNotInclude` term
 * (e.g. the old brand, a retired fake price) is found in any answer.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";

import { checkCriteria, summarizeResults, percentile } from "./kb/evalCriteria.mjs";

/**
 * Runs every question in `questions` through `askFn`, checks the answer
 * against its criteria, and returns per-question results plus a summary.
 * All I/O is injected so this is unit-testable without any real network call.
 *
 * @param {{
 *   questions: { id: string, lang: string, question: string, mustInclude?: (string|string[])[], mustNotInclude?: string[] }[],
 *   askFn: (question: string) => Promise<string>,
 *   now?: () => number,
 * }} params
 */
export async function runEval({ questions, askFn, now = Date.now }) {
  const results = [];

  for (const q of questions) {
    const start = now();
    const answer = await askFn(q.question);
    const latencyMs = now() - start;

    const { pass, missingInclude, foundForbidden } = checkCriteria(answer, {
      mustInclude: q.mustInclude ?? [],
      mustNotInclude: q.mustNotInclude ?? [],
    });

    results.push({
      id: q.id,
      lang: q.lang,
      question: q.question,
      answer,
      pass,
      missingInclude,
      foundForbidden,
      latencyMs,
    });
  }

  const summary = summarizeResults(results);
  const latencyP95 = percentile(results.map((r) => r.latencyMs), 95);

  return { results, summary, latencyP95 };
}

// ============================================================
// CLI entry — real fs/env/fetch/Supabase wiring. Not covered by unit tests
// (those exercise runEval directly with an injected askFn); this block only
// runs when the file is executed directly, e.g. `npm run eval-kb`. Signs in
// anonymously (publishable/anon key, same path the real chatbot UI uses) and
// calls the DEPLOYED chat-with-rag function for every question in
// scripts/kb/eval-set.json.
// ============================================================

async function main() {
  const { createClient } = await import("@supabase/supabase-js");
  const dotenv = await import("dotenv");
  const { readFile } = await import("node:fs/promises");

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  dotenv.config({ path: path.join(__dirname, "../.env.local") });

  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY,
  };
  const missing = Object.entries(env)
    .filter(([, value]) => !value)
    .map(([key]) => key);
  if (missing.length > 0) {
    console.error(`eval-kb: missing required environment variable(s): ${missing.join(", ")}`);
    process.exit(1);
  }

  // No anonymous sign-in: it is disabled in production, and chat-with-rag
  // accepts the publishable key alone, which is exactly how the public chat
  // widget calls it. Evaluating through the same path keeps the eval honest.
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

  const askFn = async (query) => {
    const { data, error } = await supabase.functions.invoke("chat-with-rag", { body: { query } });
    if (error) throw new Error(`chat-with-rag call failed: ${error.message}`);
    return data?.response ?? "";
  };

  const raw = await readFile(path.join(__dirname, "kb", "eval-set.json"), "utf-8");
  const questions = JSON.parse(raw);

  const { results, summary, latencyP95 } = await runEval({ questions, askFn });

  for (const r of results) {
    const status = r.pass ? "PASS" : "FAIL";
    console.log(`[${status}] (${r.lang}) ${r.id} — ${r.latencyMs}ms`);
    if (!r.pass) {
      if (r.missingInclude.length) console.log(`    missing: ${JSON.stringify(r.missingInclude)}`);
      if (r.foundForbidden.length) console.log(`    forbidden found: ${JSON.stringify(r.foundForbidden)}`);
    }
  }

  console.log("");
  console.log(
    `Total: ${summary.total}  Passed: ${summary.passed}  Failed: ${summary.failed}  Pass rate: ${(summary.passRate * 100).toFixed(1)}%`,
  );
  console.log(`Latency p95: ${latencyP95}ms`);

  if (summary.passRate < 0.9 || summary.forbiddenHits.length > 0) {
    console.error("eval-kb: FAILED — pass rate below 90% or a forbidden term was found in an answer.");
    process.exit(1);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
