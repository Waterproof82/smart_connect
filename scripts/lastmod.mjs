import { execFileSync } from "node:child_process";

// Git-derived sitemap `lastmod` resolver — see design.md (seo-nap-eeat-fixes)
// D6-D9 and the "Sitemap Lastmod Specification" (specs/sitemap-lastmod).
//
// Contract: this module NEVER throws and NEVER fabricates a date. Every
// failure mode (missing git, non-zero exit, shallow clone, malformed output)
// falls back to the route's reviewed hardcoded `lastmod` (the "floor").
// `exec` is injected so tests never shell out to real `git` (see
// tests/unit/scripts/lastmod.test.ts).

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Default git executor: runs `git <args>` and returns trimmed stdout.
 * Throws on any spawn/exit failure — callers are responsible for catching.
 * @param {string[]} args
 * @returns {string}
 */
export const defaultExec = (args) =>
  execFileSync("git", args, {
    encoding: "utf-8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim();

/**
 * Whether the repository has full (non-shallow) git history.
 * Any thrown error (git missing, not a repo, etc.) is treated as "no",
 * which is the safe default — it forces the fallback path.
 * @param {(args: string[]) => string} exec
 * @returns {boolean}
 */
export function hasFullHistory(exec) {
  try {
    return exec(["rev-parse", "--is-shallow-repository"]) === "false";
  } catch {
    return false;
  }
}

/**
 * Newest commit date (`%cs`, YYYY-MM-DD) across a route's source files,
 * following only the first-parent chain (the date it landed on this
 * branch, not when it was authored on a feature branch — D8).
 * Returns null (never throws) when sources is empty, git errors, or the
 * output isn't a valid date — the caller then uses the hardcoded floor.
 * @param {string[]} sources
 * @param {(args: string[]) => string} exec
 * @returns {string | null}
 */
export function gitLastmod(sources, exec) {
  if (!Array.isArray(sources) || sources.length === 0) return null;
  let output;
  try {
    output = exec([
      "log",
      "-1",
      "--first-parent",
      "--format=%cs",
      "--",
      ...sources,
    ]);
  } catch {
    return null;
  }
  const date = typeof output === "string" ? output.trim() : "";
  return ISO_DATE_RE.test(date) ? date : null;
}

/**
 * Resolves `lastmod` for every route: `max(gitDate, hardcodedFloor)` when
 * full git history is available, the hardcoded floor otherwise (D6, D9).
 * Strips `sources` from the returned route objects (internal-only field —
 * scripts/sitemap.mjs never sees it and performs no git calls itself).
 * @param {Array<{path: string, lastmod?: string, sources?: string[]}>} routes
 * @param {{ exec?: (args: string[]) => string }} [options]
 * @returns {{ routes: Array<object>, mode: "git" | "fallback", reason: string | null }}
 */
export function resolveRouteLastmods(routes, { exec = defaultExec } = {}) {
  const fullHistory = hasFullHistory(exec);
  const mode = fullHistory ? "git" : "fallback";
  const reason = fullHistory
    ? null
    : "git unavailable, errored, or repository is a shallow clone";

  const resolvedRoutes = routes.map((route) => {
    const { sources, lastmod: floor, ...rest } = route;
    let lastmod = floor;
    if (fullHistory) {
      const gitDate = gitLastmod(sources, exec);
      if (gitDate && (!floor || gitDate > floor)) {
        lastmod = gitDate;
      }
    }
    return { ...rest, lastmod };
  });

  return { routes: resolvedRoutes, mode, reason };
}
