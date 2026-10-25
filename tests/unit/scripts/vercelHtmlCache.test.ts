import fs from "node:fs";
import path from "node:path";

// Each deploy deletes the previous deploy's hashed /assets/* files (they
// answer 404 right away). A browser that keeps an old HTML page would ask
// for chunk names that no longer exist, and the page loses hydration.
// So browsers must revalidate HTML on every visit (max-age=0); only the
// Vercel edge may cache it (s-maxage), and Vercel purges that on deploy.
// Hashed assets stay immutable for a year.
const ROOT = path.resolve(__dirname, "../../../");
const vercel = JSON.parse(
  fs.readFileSync(path.join(ROOT, "vercel.json"), "utf-8"),
) as {
  headers: Array<{ source: string; headers: Array<{ key: string; value: string }> }>;
};

const cacheRules = vercel.headers.flatMap((rule) =>
  rule.headers
    .filter((h) => h.key.toLowerCase() === "cache-control")
    .map((h) => ({ source: rule.source, value: h.value })),
);
const isHashedAssetRule = (source: string) =>
  source.startsWith("/assets/") || source.startsWith("/fonts/");

describe("vercel.json — HTML is never cached by browsers across deploys", () => {
  it("has at least one HTML Cache-Control rule (guard is not vacuous)", () => {
    expect(cacheRules.filter((r) => !isHashedAssetRule(r.source)).length).toBeGreaterThan(0);
  });

  it.each(cacheRules.filter((r) => !isHashedAssetRule(r.source)))(
    "HTML rule $source: browsers revalidate, only the edge caches",
    ({ value }) => {
      expect(value).toMatch(/(^|,\s*)max-age=0(,|$)/);
      expect(value).toMatch(/must-revalidate/);
      expect(value).toMatch(/s-maxage=\d+/);
      expect(value).not.toMatch(/immutable/);
    },
  );

  it.each(cacheRules.filter((r) => isHashedAssetRule(r.source)))(
    "hashed asset rule $source stays immutable for a year",
    ({ value }) => {
      expect(value).toBe("public, max-age=31536000, immutable");
    },
  );
});
