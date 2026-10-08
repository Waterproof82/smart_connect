/**
 * Pure grounded-answer evaluation criteria (design.md
 * rag-knowledge-base-refresh Unit 8; spec `chatbot-rag` "Grounded Answer
 * Evaluation Set"). No fs/Deno/network imports — `scripts/eval-knowledge-base.mjs`
 * calls into this with the deployed chatbot's answer text already fetched.
 *
 * `mustInclude` entries are either a plain string (must appear, case-insensitive
 * substring match) or an array of strings (an OR-group — at least one option
 * must appear). `mustNotInclude` entries are plain strings that must NEVER
 * appear (case-insensitive substring match) — e.g. the old brand name or a
 * fake/retired price.
 */

/** @param {string} text @param {string} term */
function includesCaseInsensitive(text, term) {
  return text.toLowerCase().includes(String(term).toLowerCase());
}

/**
 * @param {string} answer
 * @param {{ mustInclude?: (string|string[])[], mustNotInclude?: string[] }} [criteria]
 * @returns {{ pass: boolean, missingInclude: (string|string[])[], foundForbidden: string[] }}
 */
export function checkCriteria(answer, { mustInclude = [], mustNotInclude = [] } = {}) {
  const text = answer ?? "";

  const missingInclude = mustInclude.filter((entry) => {
    const options = Array.isArray(entry) ? entry : [entry];
    return !options.some((option) => includesCaseInsensitive(text, option));
  });

  const foundForbidden = mustNotInclude.filter((term) => includesCaseInsensitive(text, term));

  return {
    pass: missingInclude.length === 0 && foundForbidden.length === 0,
    missingInclude,
    foundForbidden,
  };
}

/**
 * @param {{ id: string, pass: boolean, foundForbidden?: string[] }[]} results
 */
export function summarizeResults(results) {
  const total = results.length;
  const passed = results.filter((r) => r.pass).length;
  const failed = total - passed;
  const failingIds = results.filter((r) => !r.pass).map((r) => r.id);
  const forbiddenHits = results.filter((r) => (r.foundForbidden ?? []).length > 0).map((r) => r.id);

  return {
    total,
    passed,
    failed,
    passRate: total === 0 ? 0 : passed / total,
    failingIds,
    forbiddenHits,
  };
}

/** Nearest-rank percentile (e.g. p95 latency). @param {number[]} values @param {number} p */
export function percentile(values, p) {
  if (!values || values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const rank = Math.ceil((p / 100) * sorted.length);
  const index = Math.min(Math.max(rank - 1, 0), sorted.length - 1);
  return sorted[index];
}
