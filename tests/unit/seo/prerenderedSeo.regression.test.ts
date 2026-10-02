import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "../../../");
const DIST = path.join(ROOT, "dist");
const { origin, routes } = JSON.parse(
  fs.readFileSync(path.join(ROOT, "scripts/site-routes.json"), "utf-8"),
) as { origin: string; routes: Array<{ path: string; lastmod?: string }> };
const vercel = JSON.parse(fs.readFileSync(path.join(ROOT, "vercel.json"), "utf-8")) as {
  redirects: Array<{ source: string; destination: string }>;
};

const routeFile = (routePath: string): string =>
  routePath === "/"
    ? path.join(DIST, "index.html")
    : path.join(DIST, routePath.replace(/^\//, ""), "index.html");

const distBuilt = routes.every((route) => fs.existsSync(routeFile(route.path))) && fs.existsSync(path.join(DIST, "sitemap.xml"));

const pages = distBuilt
  ? routes.map((route) => ({
      path: route.path,
      url: route.path === "/" ? `${origin}/` : `${origin}${route.path}`,
      html: fs.readFileSync(routeFile(route.path), "utf-8"),
    }))
  : [];

const tags = (html: string, tag: string): string[] => html.match(new RegExp(`<${tag}\\b[^>]*>`, "gi")) ?? [];
const attr = (tag: string, name: string): string | null =>
  tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, "i"))?.[1] ?? null;
const metaContent = (html: string, key: string, value: string): string[] =>
  tags(html, "meta")
    .filter((tag) => attr(tag, key) === value)
    .map((tag) => attr(tag, "content") ?? "");
const jsonLdBlocks = (html: string): string[] =>
  [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]);
const strip = (html: string): string =>
  html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "");
const text = (fragment: string): string => fragment.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

const registerSuite = (): void => {
  describe.each(pages.map((page) => [page.path, page] as const))("route %s", (_route, page) => {
    it("declares the document language", () => {
      expect(page.html).toMatch(/<html[^>]*\blang="es"/i);
    });

    it("has exactly one non-empty title", () => {
      const titles = [...page.html.matchAll(/<title[^>]*>([\s\S]*?)<\/title>/gi)].map((m) => text(m[1]));
      expect(titles).toHaveLength(1);
      expect(titles[0].length).toBeGreaterThan(10);
    });

    it("has exactly one non-empty meta description", () => {
      const descriptions = metaContent(page.html, "name", "description");
      expect(descriptions).toHaveLength(1);
      expect(descriptions[0].length).toBeGreaterThan(50);
    });

    it("has exactly one self-referencing absolute canonical", () => {
      const canonicals = tags(page.html, "link")
        .filter((tag) => attr(tag, "rel") === "canonical")
        .map((tag) => attr(tag, "href"));
      expect(canonicals).toEqual([page.url]);
    });

    it("matches og:url, og:title and og:image to the page and the official origin", () => {
      const ogTitle = metaContent(page.html, "property", "og:title");
      expect(metaContent(page.html, "property", "og:url")).toEqual([page.url]);
      expect(ogTitle).toHaveLength(1);
      expect(metaContent(page.html, "property", "og:image")[0]).toMatch(new RegExp(`^${origin}/`));
    });

    it("is not noindex", () => {
      const robots = metaContent(page.html, "name", "robots").join(",");
      expect(robots).not.toMatch(/noindex/i);
    });

    it("has exactly one H1 with text in the server HTML", () => {
      const h1s = [...strip(page.html).matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => text(m[1]));
      expect(h1s).toHaveLength(1);
      expect(h1s[0].length).toBeGreaterThan(5);
    });

    it("keeps heading levels without skipping a level", () => {
      const levels = [...strip(page.html).matchAll(/<h([1-6])\b/gi)].map((m) => Number(m[1]));
      const jumps = levels.filter((level, i) => i > 0 && level > levels[i - 1] + 1);
      expect(jumps).toEqual([]);
    });

    it("serves JSON-LD that parses and only references the official origin", () => {
      for (const block of jsonLdBlocks(page.html)) {
        const parsed = JSON.parse(block);
        const urls: string[] = [];
        const visit = (node: unknown): void => {
          if (Array.isArray(node)) node.forEach(visit);
          else if (node && typeof node === "object") {
            for (const [key, value] of Object.entries(node)) {
              if ((key === "@id" || key === "url") && typeof value === "string") urls.push(value);
              visit(value);
            }
          }
        };
        visit(parsed);
        const foreign = urls.filter((url) => /^https?:\/\//.test(url) && !url.startsWith(origin));
        expect(parsed["@context"] ?? parsed[0]?.["@context"]).toMatch(/schema\.org/);
        expect(foreign).toEqual([]);
      }
    });

    it("has no <img> without alt or without intrinsic dimensions", () => {
      const images = tags(strip(page.html), "img");
      expect(images.filter((tag) => attr(tag, "alt") === null)).toEqual([]);
      expect(images.filter((tag) => !attr(tag, "width") || !attr(tag, "height"))).toEqual([]);
    });

    it("uses real hrefs on internal navigation anchors", () => {
      const anchors = tags(strip(page.html), "a").filter((tag) => /^<a\s/i.test(tag));
      expect(anchors.filter((tag) => !/\bhref=/.test(tag))).toEqual([]);
    });

    it("links internally only to existing pages, files or redirects", () => {
      const known = new Set(routes.map((route) => route.path));
      const redirects = new Set(vercel.redirects.map((redirect) => redirect.source));
      const hrefs = tags(strip(page.html), "a")
        .map((tag) => attr(tag, "href"))
        .filter((href): href is string => !!href)
        .map((href) => href.replace(origin, ""))
        .filter((href) => href.startsWith("/") && !href.startsWith("//"))
        .map((href) => href.split("#")[0].split("?")[0] || "/");
      const broken = hrefs.filter(
        (href) =>
          !known.has(href) &&
          !redirects.has(href) &&
          !fs.existsSync(path.join(DIST, href)) &&
          !fs.existsSync(path.join(ROOT, "public", href)) &&
          !/^\/(admin|panel|login)(\/|$)/.test(href),
      );
      expect([...new Set(broken)]).toEqual([]);
    });
  });

  it("gives every route a unique title, description and H1", () => {
    const titles = pages.map((page) => text(page.html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? ""));
    const descriptions = pages.map((page) => metaContent(page.html, "name", "description")[0]);
    expect(new Set(titles).size).toBe(pages.length);
    expect(new Set(descriptions).size).toBe(pages.length);
  });

  describe("sitemap.xml", () => {
    const sitemap = fs.existsSync(path.join(DIST, "sitemap.xml")) ? fs.readFileSync(path.join(DIST, "sitemap.xml"), "utf-8") : "";
    const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

    it("is a well-formed urlset in the sitemap namespace", () => {
      expect(sitemap).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>/);
      expect(sitemap).toMatch(/<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);
      expect((sitemap.match(/<url>/g) ?? []).length).toBe((sitemap.match(/<\/url>/g) ?? []).length);
    });

    it("lists exactly the prerendered routes, once each", () => {
      expect(new Set(locs).size).toBe(locs.length);
      expect([...locs].sort()).toEqual(pages.map((page) => page.url).sort());
    });

    it("lists only URLs equal to each page's canonical", () => {
      const canonicals = pages.map(
        (page) => tags(page.html, "link").find((tag) => attr(tag, "rel") === "canonical" && attr(tag, "href"))?.match(/href="([^"]+)"/)?.[1],
      );
      expect([...locs].sort()).toEqual([...(canonicals as string[])].sort());
    });
  });

  describe("non-indexable outputs", () => {
    it("serves 404.html with noindex and without a canonical", () => {
      const html = fs.readFileSync(path.join(DIST, "404.html"), "utf-8");
      expect(metaContent(html, "name", "robots").join(",")).toMatch(/noindex/i);
      expect(tags(html, "link").filter((tag) => attr(tag, "rel") === "canonical")).toEqual([]);
    });

    it("keeps the SPA fallback out of the sitemap", () => {
      const sitemap = fs.readFileSync(path.join(DIST, "sitemap.xml"), "utf-8");
      expect(sitemap).not.toMatch(/_spa|\/admin|\/panel|\/login/);
    });
  });

  describe("built robots.txt", () => {
    it("is identical to public/robots.txt", () => {
      expect(fs.readFileSync(path.join(DIST, "robots.txt"), "utf-8")).toBe(
        fs.readFileSync(path.join(ROOT, "public/robots.txt"), "utf-8"),
      );
    });
  });
};

const SUITE_NAME = "SEO regression — prerendered HTML (requires `npm run build`)";

if (distBuilt) {
  describe(SUITE_NAME, registerSuite);
} else {
  describe.skip(SUITE_NAME, () => {
    it("runs only after dist/ has been built", () => undefined);
  });
}

// ─── Structured data policy: Review/HowTo must never ship (PR1) ──────────
// `dist/` is gitignored and may exist locally from a build that predates
// this change's source edits (SeoSchema.tsx / HowItWorks.tsx / SocialProof.tsx
// / SuccessStats.tsx). Comparing against a stale dist would be a false
// negative (old JSON-LD baked into old HTML), not a real regression. Gate on
// `distFresh` — dist/index.html newer than every touched source file — so
// this skips gracefully both when dist is absent AND when it's stale, and
// only asserts for real once a build run after this change exists.
const TOUCHED_SOURCES = [
  "src/shared/presentation/components/SeoSchema.tsx",
  "src/features/tap-review/presentation/components/HowItWorks.tsx",
  "src/features/tap-review/presentation/components/SocialProof.tsx",
  "src/features/landing/presentation/components/SuccessStats.tsx",
].map((relative) => path.join(ROOT, relative));

const distIndexPath = path.join(DIST, "index.html");
const distMtime = fs.existsSync(distIndexPath) ? fs.statSync(distIndexPath).mtimeMs : 0;
const distFresh =
  distBuilt && TOUCHED_SOURCES.every((file) => fs.statSync(file).mtimeMs <= distMtime);

const describeIfFresh = distFresh ? describe : describe.skip;

describeIfFresh("structured data policy — Review/HowTo markup (PR1)", () => {
  it("has zero '@type':'Review' or '@type':'HowTo*' JSON-LD blocks in any prerendered route", () => {
    const offenders: { path: string; type: string }[] = [];
    for (const page of pages) {
      for (const block of jsonLdBlocks(page.html)) {
        if (/"@type"\s*:\s*"Review"/.test(block)) {
          offenders.push({ path: page.path, type: "Review" });
        }
        if (/"@type"\s*:\s*"HowTo\w*"/.test(block)) {
          offenders.push({ path: page.path, type: "HowTo" });
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});
