import TurndownService from "turndown";

/**
 * Shared, pure HTML→Markdown extraction (design.md rag-knowledge-base-refresh
 * D8). Two consumers:
 * - `api/negotiate.mjs` calls `extractPageMarkdown(html, { route, scope: "root" })`
 *   — byte-identical to the pre-refactor inline logic, guarded by
 *   tests/unit/scripts/negotiateApi.test.ts.
 * - the knowledge-base ingestion pipeline (Unit 5/7) will call it with
 *   `scope: "main"` to get cleaner body content (nav/JSON-LD stripped), and
 *   will call `extractFaqJsonLd(html)` to pull FAQ Q&A straight from the
 *   prerendered FAQPage JSON-LD instead of re-parsing visible markup.
 *
 * No Deno/Vercel/fs imports — pure string transforms over an HTML string.
 */

const turndownService = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  emDelimiter: "*",
  linkStyle: "inlined",
});

function extractTitle(html) {
  return html.match(/<title[^>]*>([^<]*)<\/title>/)?.[1] || "SmartConnect AI";
}

function extractDescription(html) {
  return (
    html.match(/<meta[^>]+name="description"[^>]+content="([^"]*)"/i)?.[1] ||
    ""
  );
}

function cleanHydrationMarkers(rawContent) {
  return rawContent
    .replace(/<!--\s*\?|\?\s*-->/g, "")
    .replace(/<!--ssr-outlet-->/g, "")
    .replace(/<!--\$-->/g, "")
    .replace(/<!--\/\$-->/g, "")
    .replace(/<!--\[-->/g, "")
    .replace(/<!--\]-->/g, "")
    .replace(/\s*$/, "")
    .trim();
}

/** Same capture negotiate.mjs always used: everything between the #root div
 * and the next opening tag (script/style), i.e. the pre-hydration markup. */
function extractRootContent(html) {
  const rootMatch = html.match(/<div\s+id="root"[^>]*>([\s\S]*?)<\/div>\s*</);
  return rootMatch?.[1] || html;
}

function extractMainContent(html) {
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/);
  if (!mainMatch) return extractRootContent(html);

  return mainMatch[1]
    .replace(/<script[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "");
}

/**
 * @param {string} html
 * @param {{ route?: string, scope?: "root" | "main" }} [options]
 * @returns {{ title: string, description: string, markdown: string }}
 */
export function extractPageMarkdown(html, { route, scope = "root" } = {}) {
  const title = extractTitle(html);
  const description = extractDescription(html);

  const rawContent =
    scope === "main" ? extractMainContent(html) : extractRootContent(html);
  const cleanContent = cleanHydrationMarkers(rawContent);
  const markdownBody = turndownService.turndown(cleanContent);

  const markdown = [
    `# ${title}`,
    description ? `> ${description}\n` : "",
    markdownBody,
    "",
    route
      ? `---\n_Source: [https://digitalizatenerife.es${route}](https://digitalizatenerife.es${route})_`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  return { title, description, markdown };
}

/**
 * Pulls Q&A pairs out of any FAQPage JSON-LD `<script>` in the HTML,
 * whether the FAQPage node is top-level or nested inside an `@graph` array
 * (both shapes exist in this codebase — see SeoSchema.tsx's
 * buildHomeSchema() vs SeoFaqSchema).
 *
 * @param {string} html
 * @returns {{ question: string, answer: string }[]}
 */
export function extractFaqJsonLd(html) {
  const scriptBlocks = [
    ...html.matchAll(
      /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi,
    ),
  ];

  const faqNodes = [];
  for (const [, jsonText] of scriptBlocks) {
    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      continue;
    }

    const candidates = Array.isArray(parsed["@graph"])
      ? parsed["@graph"]
      : [parsed];

    for (const node of candidates) {
      if (node && node["@type"] === "FAQPage" && Array.isArray(node.mainEntity)) {
        faqNodes.push(node);
      }
    }
  }

  return faqNodes.flatMap((node) =>
    node.mainEntity.map((question) => ({
      question: question.name,
      answer: question.acceptedAnswer?.text || "",
    })),
  );
}
