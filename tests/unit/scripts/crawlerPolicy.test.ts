import fs from "node:fs";
import path from "node:path";

// S6 (seo-audit-followups): design.md D3 + the orchestrator's verified
// Appendix (accessed 2026-10-02) — robots.txt groups must match the
// declared Content-Signal (ai-train=no, search=yes, ai-input=yes):
// training-only crawlers are disallowed, search/user-triggered crawlers
// (including the allowed training-exception Google-Extended) stay allowed,
// and every group — named or the `*` fallback — keeps the private-path
// disallows. This file is the single test-owned policy table that drives
// and verifies public/robots.txt (crawler-policy spec: "UA Classification
// Table Drives the File").

const ROOT = path.resolve(__dirname, "../../../");
const robots = fs.readFileSync(path.join(ROOT, "public/robots.txt"), "utf-8");

interface RobotsGroup {
  agents: string[]; // lowercased
  disallow: string[];
  allow: string[];
  contentSignal?: string;
}

/**
 * Minimal RFC 9309 group parser: one or more consecutive `User-agent:`
 * lines form a single group; every following non-blank, non-`Sitemap:`
 * line (until the next `User-agent:` run) belongs to that group.
 */
function parseRobotsGroups(source: string): RobotsGroup[] {
  const groups: RobotsGroup[] = [];
  let current: RobotsGroup | null = null;
  let lastWasAgent = false;

  for (const raw of source.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) {
      lastWasAgent = false;
      continue;
    }
    const sep = line.indexOf(":");
    if (sep === -1) continue;
    const field = line.slice(0, sep).trim().toLowerCase();
    const value = line.slice(sep + 1).trim();

    if (field === "user-agent") {
      if (!current || !lastWasAgent) {
        current = { agents: [], disallow: [], allow: [] };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
      lastWasAgent = true;
      continue;
    }
    lastWasAgent = false;
    if (!current || field === "sitemap") continue;
    if (field === "disallow") current.disallow.push(value);
    else if (field === "allow") current.allow.push(value);
    else if (field === "content-signal") current.contentSignal = value;
  }
  return groups;
}

/** RFC 9309 §2.2.1: a crawler obeys only its single most specific group — an
 * exact (case-insensitive) product-token match, else the `*` group. */
function groupForUA(groups: RobotsGroup[], ua: string): RobotsGroup | undefined {
  const lower = ua.toLowerCase();
  return (
    groups.find((g) => g.agents.includes(lower)) ??
    groups.find((g) => g.agents.includes("*"))
  );
}

type Category = "search" | "user-triggered" | "training-only";

interface PolicyEntry {
  ua: string;
  category: Category;
  /** Google-Extended: training UA, explicitly allowed as a documented
   * exception (design.md D3 — it also governs Gemini grounding = ai-input). */
  exceptionAllowed?: boolean;
  citation: string;
}

// Single source of truth (design.md Policy table + verified Appendix,
// orchestrator-accessed 2026-10-02). robots.txt MUST match this table
// exactly: every training-only (non-excepted) UA explicitly named with
// Disallow: /; every other UA resolves (named or via `*`) to a group that
// allows `/` and still disallows /admin, /panel, /login.
const POLICY_TABLE: PolicyEntry[] = [
  { ua: "Googlebot", category: "search", citation: "developers.google.com/search/docs/crawling-indexing/overview-google-crawlers" },
  { ua: "Google-Extended", category: "training-only", exceptionAllowed: true, citation: "developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers" },
  { ua: "Bingbot", category: "search", citation: "bing.com/webmasters/help/which-crawlers-does-bing-use-8c184ec0" },
  { ua: "Applebot", category: "search", citation: "support.apple.com/en-us/119829" },
  { ua: "Applebot-Extended", category: "training-only", citation: "support.apple.com/en-us/119829" },
  { ua: "OAI-SearchBot", category: "search", citation: "developers.openai.com/api/docs/bots" },
  { ua: "ChatGPT-User", category: "user-triggered", citation: "developers.openai.com/api/docs/bots" },
  { ua: "GPTBot", category: "training-only", citation: "developers.openai.com/api/docs/bots" },
  { ua: "Claude-SearchBot", category: "search", citation: "support.claude.com/en/articles/8896518" },
  { ua: "Claude-User", category: "user-triggered", citation: "support.claude.com/en/articles/8896518" },
  { ua: "ClaudeBot", category: "training-only", citation: "support.claude.com/en/articles/8896518" },
  { ua: "PerplexityBot", category: "search", citation: "docs.perplexity.ai/guides/bots" },
  { ua: "Perplexity-User", category: "user-triggered", citation: "docs.perplexity.ai/guides/bots" },
  { ua: "Meta-ExternalFetcher", category: "user-triggered", citation: "developers.facebook.com/docs/sharing/webmasters/web-crawlers" },
  { ua: "Meta-ExternalAgent", category: "training-only", citation: "developers.facebook.com/docs/sharing/webmasters/web-crawlers" },
  { ua: "CCBot", category: "training-only", citation: "commoncrawl.org/ccbot" },
  { ua: "Amazonbot", category: "training-only", citation: "developer.amazon.com/amazonbot" },
  { ua: "Amzn-SearchBot", category: "search", citation: "developer.amazon.com/amazonbot" },
  { ua: "Amzn-User", category: "user-triggered", citation: "developer.amazon.com/amazonbot" },
  { ua: "Bytespider", category: "training-only", citation: "no vendor page known (blocking an unknown name is harmless)" },
];

const isActuallyDisallowed = (entry: PolicyEntry): boolean =>
  entry.category === "training-only" && !entry.exceptionAllowed;

const PRIVATE_PATHS = ["/admin", "/panel", "/login"];

describe("crawlerPolicy — policy table (design.md D3 + Appendix, crawler-policy spec)", () => {
  const groups = parseRobotsGroups(robots);

  it("every UA in the policy table has a citation", () => {
    for (const entry of POLICY_TABLE) {
      expect(entry.citation.length).toBeGreaterThan(0);
    }
  });

  it.each(POLICY_TABLE)(
    "$ua ($category) resolves to the correct robots.txt disallow behavior",
    (entry) => {
      const group = groupForUA(groups, entry.ua);
      expect(group).toBeDefined();
      const blanketDisallow = group!.disallow.includes("/");
      expect(blanketDisallow).toBe(isActuallyDisallowed(entry));
    },
  );

  it("every training-only UA (not an allowed exception) is named explicitly with Disallow: /", () => {
    const trainingOnly = POLICY_TABLE.filter(isActuallyDisallowed);
    expect(trainingOnly.map((e) => e.ua).sort()).toEqual(
      [
        "GPTBot",
        "ClaudeBot",
        "Applebot-Extended",
        "CCBot",
        "Meta-ExternalAgent",
        "Bytespider",
        "Amazonbot",
      ].sort(),
    );
    for (const entry of trainingOnly) {
      const namedGroup = groups.find((g) =>
        g.agents.includes(entry.ua.toLowerCase()),
      );
      expect(namedGroup).toBeDefined();
      expect(namedGroup!.agents).not.toContain("*");
    }
  });

  it("Google-Extended, Amzn-SearchBot and Amzn-User have no explicit group — they fall through to *", () => {
    for (const ua of ["Google-Extended", "Amzn-SearchBot", "Amzn-User"]) {
      const namedGroup = groups.find((g) =>
        g.agents.includes(ua.toLowerCase()),
      );
      expect(namedGroup).toBeUndefined();
    }
  });

  it("every group (named or wildcard) carries the private-path disallows", () => {
    for (const group of groups) {
      for (const p of PRIVATE_PATHS) {
        expect(group.disallow).toContain(p);
      }
    }
  });

  it("the Content-Signal line is preserved verbatim on the wildcard group", () => {
    const wildcard = groups.find((g) => g.agents.includes("*"));
    expect(wildcard?.contentSignal).toBe(
      "search=yes, ai-input=yes, ai-train=no",
    );
  });

  it("robots.txt names no UA absent from the policy table", () => {
    const tableUAs = new Set(
      POLICY_TABLE.map((e) => e.ua.toLowerCase()),
    );
    const fileUAs = groups.flatMap((g) => g.agents).filter((a) => a !== "*");
    const unknown = fileUAs.filter((a) => !tableUAs.has(a));
    expect(unknown).toEqual([]);
  });

  it("the sitemap line is kept, with the absolute official URL", () => {
    expect(robots).toMatch(
      /^Sitemap: https:\/\/digitalizatenerife\.es\/sitemap\.xml$/m,
    );
  });
});
