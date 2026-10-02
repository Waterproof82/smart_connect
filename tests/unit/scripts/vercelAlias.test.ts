import fs from "node:fs";
import path from "node:path";

// design.md D6 + Appendix (Vercel `has`/`missing` value semantics, verified
// 2026-10-02): `has[].value` is "a regex like string", not a plain string
// match, so the alias host MUST be an anchored, escaped regex
// (`^smart-connect-olive\.vercel\.app$`) — an unanchored value would also
// match preview hosts that merely contain the alias as a substring.

const ROOT = path.resolve(__dirname, "../../../");

interface VercelRedirect {
  source: string;
  destination: string;
  permanent?: boolean;
  has?: Array<{ type: string; value?: string; key?: string }>;
}

const readVercelConfig = (): { redirects: VercelRedirect[] } =>
  JSON.parse(fs.readFileSync(path.join(ROOT, "vercel.json"), "utf-8"));

const ALIAS_HOST = "smart-connect-olive.vercel.app";

describe("vercel.json — alias host redirect (design.md D6, http-surface-hardening)", () => {
  const vercel = readVercelConfig();
  const [firstRedirect] = vercel.redirects;

  it("the alias redirect is the first entry in redirects", () => {
    expect(firstRedirect).toBeDefined();
    expect(firstRedirect.has).toBeDefined();
    const hostCondition = firstRedirect.has!.find((h) => h.type === "host");
    expect(hostCondition).toBeDefined();
  });

  it("is a permanent (308) redirect to the official domain with the path preserved", () => {
    expect(firstRedirect.permanent).toBe(true);
    expect(firstRedirect.destination).toBe(
      "https://digitalizatenerife.es/:path*",
    );
    expect(firstRedirect.source).toBe("/:path*");
  });

  it("the host condition value is an anchored, escaped regex", () => {
    const hostCondition = firstRedirect.has!.find((h) => h.type === "host")!;
    expect(hostCondition.value).toBe("^smart-connect-olive\\.vercel\\.app$");
  });

  describe("host regex evaluation", () => {
    const hostCondition = firstRedirect.has!.find((h) => h.type === "host")!;
    const hostRegex = new RegExp(hostCondition.value!);

    it("matches the exact alias host", () => {
      expect(hostRegex.test(ALIAS_HOST)).toBe(true);
    });

    it.each([
      "smart-connect-olive-git-feature-foo.vercel.app",
      "smart-connect-git-feat-x-joses-projects-b4268445.vercel.app",
      "smart-connect-di28f1dg2-joses-projects-b4268445.vercel.app",
      "smart-connect-olive.vercel.app.evil.com",
      "evil.com/smart-connect-olive.vercel.app",
      "vercel.app",
    ])("does NOT match preview/foreign host %s", (host) => {
      expect(hostRegex.test(host)).toBe(false);
    });

    it("does NOT match the official production host", () => {
      expect(hostRegex.test("digitalizatenerife.es")).toBe(false);
    });
  });
});
