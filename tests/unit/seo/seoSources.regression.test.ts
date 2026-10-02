import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "../../../");
const read = (rel: string): string => fs.readFileSync(path.join(ROOT, rel), "utf-8");
const readJson = (rel: string) => JSON.parse(read(rel));

const { origin, routes } = readJson("scripts/site-routes.json") as {
  origin: string;
  routes: Array<{ path: string; lastmod?: string }>;
};
const vercel = readJson("vercel.json") as {
  redirects: Array<{
    source: string;
    destination: string;
    permanent?: boolean;
    has?: Array<{ type: string; value?: string; key?: string }>;
  }>;
  headers: Array<{ source: string; headers: Array<{ key: string; value: string }> }>;
};

const OFFICIAL_ORIGIN = "https://digitalizatenerife.es";
const UNOFFICIAL_HOST = "smartconnectai.es";

function walk(dir: string, exts: string[]): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full, exts);
    return exts.some((ext) => entry.name.endsWith(ext)) ? [full] : [];
  });
}

function robotsGroups(robots: string): Array<{ agents: string[]; rules: string[] }> {
  const groups: Array<{ agents: string[]; rules: string[] }> = [];
  let current: { agents: string[]; rules: string[] } | null = null;
  let lastWasAgent = false;
  for (const raw of robots.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) {
      lastWasAgent = false;
      continue;
    }
    const [field, ...rest] = line.split(":");
    const key = field.toLowerCase();
    const value = rest.join(":").trim();
    if (key === "user-agent") {
      if (!current || !lastWasAgent) {
        current = { agents: [], rules: [] };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
      lastWasAgent = true;
    } else if (current && key !== "sitemap") {
      current.rules.push(`${key}:${value}`);
      lastWasAgent = false;
    }
  }
  return groups;
}

describe("SEO regression — robots.txt", () => {
  const robots = read("public/robots.txt");
  const groups = robotsGroups(robots);

  it("declares the sitemap with the absolute official URL", () => {
    expect(robots).toMatch(new RegExp(`^Sitemap: ${OFFICIAL_ORIGIN}/sitemap\\.xml$`, "m"));
  });

  it("never disallows the whole site for any user agent", () => {
    const blockers = groups.filter((group) => group.rules.includes("disallow:/"));
    expect(blockers).toEqual([]);
  });

  it("lets Googlebot crawl the site", () => {
    const googlebot = groups.find((group) => group.agents.includes("googlebot"));
    expect(googlebot).toBeDefined();
    expect(googlebot!.rules).toContain("allow:/");
  });

  it("keeps private areas out of the crawl for the default group", () => {
    const wildcard = groups.find((group) => group.agents.includes("*"));
    expect(wildcard).toBeDefined();
    expect(wildcard!.rules).toEqual(
      expect.arrayContaining(["disallow:/admin", "disallow:/panel", "disallow:/login"]),
    );
  });

  it("does not block rendering resources", () => {
    expect(robots).not.toMatch(/^Disallow:\s*\/(assets|static|src)\b/im);
    expect(robots).not.toMatch(/^Disallow:.*\.(js|css)\b/im);
  });
});

describe("SEO regression — Content-Signal consistency", () => {
  const normalize = (value: string): string =>
    value
      .split(",")
      .map((part) => part.trim())
      .sort()
      .join(", ");

  const robotsSignal = read("public/robots.txt").match(/^Content-Signal:\s*(.+)$/m)?.[1] ?? "";
  const vercelSignal =
    vercel.headers.flatMap((h) => h.headers).find((h) => h.key === "Content-Signal")?.value ?? "";
  const viteSignal = read("vite.config.ts").match(/"Content-Signal":\s*"([^"]+)"/)?.[1] ?? "";

  it("is declared in robots.txt, vercel.json and vite.config.ts", () => {
    expect(robotsSignal).not.toBe("");
    expect(vercelSignal).not.toBe("");
    expect(viteSignal).not.toBe("");
  });

  it("carries the same policy in all three places", () => {
    expect(normalize(vercelSignal)).toBe(normalize(robotsSignal));
    expect(normalize(viteSignal)).toBe(normalize(robotsSignal));
  });

  it("allows search and AI input while opting out of training", () => {
    expect(normalize(robotsSignal)).toBe(normalize("search=yes, ai-input=yes, ai-train=no"));
  });
});

describe("SEO regression — official domain", () => {
  it("site-routes.json uses the official origin", () => {
    expect(origin).toBe(OFFICIAL_ORIGIN);
  });

  it("no public, script or entry file references the unofficial domain", () => {
    const files = [
      ...walk(path.join(ROOT, "public"), [".txt", ".json", ".xml", ".html", ".md"]),
      ...walk(path.join(ROOT, "public/.well-known"), [""]),
      ...walk(path.join(ROOT, "scripts"), [".mjs", ".json"]),
      path.join(ROOT, "index.html"),
      path.join(ROOT, "vercel.json"),
      path.join(ROOT, "vite.config.ts"),
    ];
    const offenders = files.filter((file) => fs.readFileSync(file, "utf-8").includes(UNOFFICIAL_HOST));
    expect(offenders.map((file) => path.relative(ROOT, file))).toEqual([]);
  });

  it("no source file references the unofficial domain", () => {
    const offenders = walk(path.join(ROOT, "src"), [".ts", ".tsx", ".css"]).filter((file) =>
      fs.readFileSync(file, "utf-8").includes(UNOFFICIAL_HOST),
    );
    expect(offenders.map((file) => path.relative(ROOT, file))).toEqual([]);
  });
});

describe("SEO regression — .well-known and llms.txt surfaces", () => {
  const wellKnown = path.join(ROOT, "public/.well-known");
  const jsonSurfaces = walk(wellKnown, [""]).filter((file) => {
    const text = fs.readFileSync(file, "utf-8").trim();
    return text.startsWith("{") || text.startsWith("[");
  });

  it("finds the expected JSON surfaces", () => {
    expect(jsonSurfaces.length).toBeGreaterThanOrEqual(2);
  });

  it.each(jsonSurfaces.map((file) => [path.relative(ROOT, file), file]))(
    "%s is valid JSON",
    (_label, file) => {
      expect(() => JSON.parse(fs.readFileSync(file, "utf-8"))).not.toThrow();
    },
  );

  it("the .well-known llms.txt stays a pointer to the canonical /llms.txt", () => {
    expect(read("public/.well-known/llms.txt")).toContain(`[llms.txt](${OFFICIAL_ORIGIN}/llms.txt)`);
  });

  it("publishes no discovery document that points to a non-existent file", () => {
    const published = walk(wellKnown, [""]).map((file) => path.relative(path.join(ROOT, "public"), file));
    const text = vercel.headers.flatMap((entry) => entry.headers).find((h) => h.key === "Link")?.value ?? "";
    const linked = [...text.matchAll(/<(\/[^>]+)>/g)].map((m) => m[1].replace(/^\//, ""));
    const missing = linked.filter((rel) => !fs.existsSync(path.join(ROOT, "public", rel)));
    expect(published.length).toBeGreaterThan(0);
    expect(missing).toEqual([]);
  });

  it("llms.txt links only to the official origin", () => {
    const hosts = [...read("public/llms.txt").matchAll(/https?:\/\/([^\s)/>\]]+)/g)].map((m) => m[1]);
    const foreign = hosts.filter((host) => !host.endsWith("digitalizatenerife.es"));
    expect(foreign).toEqual([]);
  });
});

describe("SEO regression — site-routes.json as sitemap source", () => {
  it("has unique, well-formed paths", () => {
    const paths = routes.map((route) => route.path);
    expect(new Set(paths).size).toBe(paths.length);
    expect(paths.every((p) => p.startsWith("/") && (p === "/" || !p.endsWith("/")))).toBe(true);
    expect(paths.every((p) => p === p.toLowerCase())).toBe(true);
  });

  it("uses ISO lastmod dates that are not in the future", () => {
    const today = new Date().toISOString().slice(0, 10);
    for (const route of routes) {
      expect(route.lastmod).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(route.lastmod! <= today).toBe(true);
    }
  });

  it("never lists a redirected or noindexed URL", () => {
    const redirected = new Set(vercel.redirects.map((redirect) => redirect.source));
    const privatePrefix = /^\/(admin|panel|login|_spa)(\/|$)/;
    const offenders = routes.map((r) => r.path).filter((p) => redirected.has(p) || privatePrefix.test(p));
    expect(offenders).toEqual([]);
  });
});

describe("SEO regression — vercel.json redirects", () => {
  // Host-conditioned entries (e.g. the alias-host redirect, design.md D6)
  // redirect to an absolute external URL by design and are never a route
  // path or another redirect's source — they are excluded from the
  // route-chain/route-destination checks below, which only make sense for
  // same-origin path redirects.
  const pathRedirects = vercel.redirects.filter((redirect) => !redirect.has);
  const sources = new Set(pathRedirects.map((redirect) => redirect.source));
  const routePaths = new Set(routes.map((route) => route.path));

  it("are permanent (301/308)", () => {
    const temporary = vercel.redirects.filter((redirect) => !("permanent" in redirect) || (redirect as { permanent?: boolean }).permanent !== true);
    expect(temporary).toEqual([]);
  });

  it("have no duplicate sources", () => {
    expect(sources.size).toBe(pathRedirects.length);
  });

  it("never chain into another redirect or loop", () => {
    const chained = pathRedirects.filter((redirect) => sources.has(redirect.destination.split("#")[0]));
    expect(chained).toEqual([]);
  });

  it("point to a prerendered route", () => {
    const orphans = pathRedirects.filter((redirect) => !routePaths.has(redirect.destination.split("#")[0]));
    expect(orphans).toEqual([]);
  });
});

describe("SEO regression — indexing headers", () => {
  const robotsHeaders = vercel.headers.filter((entry) =>
    entry.headers.some((header) => header.key === "X-Robots-Tag"),
  );

  it("marks public pages index, follow and private areas noindex, nofollow", () => {
    const values = robotsHeaders.map((entry) => entry.headers.find((h) => h.key === "X-Robots-Tag")!.value);
    expect(values).toEqual(expect.arrayContaining(["index, follow", "noindex, nofollow"]));
  });

  it("does not leak noindex to any prerendered route", () => {
    const noindexEntries = robotsHeaders.filter((entry) =>
      entry.headers.some((h) => h.key === "X-Robots-Tag" && /noindex/.test(h.value)),
    );
    for (const entry of noindexEntries) {
      const matcher = new RegExp(`^${entry.source.replace(/:path\*/g, ".*")}$`);
      const hit = routes.map((route) => route.path).filter((p) => matcher.test(p));
      expect(hit).toEqual([]);
    }
  });

  it("keeps HTTPS enforcement and nosniff headers", () => {
    const all = vercel.headers.flatMap((entry) => entry.headers);
    expect(all.find((h) => h.key === "Strict-Transport-Security")?.value).toMatch(/max-age=\d{7,}/);
    expect(all.find((h) => h.key === "X-Content-Type-Options")?.value).toBe("nosniff");
  });
});
