import fs from "node:fs";
import path from "node:path";

// S2 (seo-audit-followups): security + head hygiene.
// design.md D5 — real Permissions-Policy HTTP header (meta tags are
// ignored by browsers for this directive), dead meta tags removed,
// charset first, Consent Mode comment accurate.

const ROOT = path.resolve(__dirname, "../../../");

const vercel = JSON.parse(
  fs.readFileSync(path.join(ROOT, "vercel.json"), "utf-8"),
) as {
  headers: Array<{
    source: string;
    headers: Array<{ key: string; value: string }>;
  }>;
};

const indexHtml = fs.readFileSync(path.join(ROOT, "index.html"), "utf-8");

const PERMISSIONS_POLICY_DIRECTIVES = [
  "camera=()",
  "microphone=()",
  "geolocation=()",
  "payment=()",
  "usb=()",
  "magnetometer=()",
  "gyroscope=()",
  "accelerometer=()",
  "browsing-topics=()",
];

describe("vercel.json — real Permissions-Policy header", () => {
  it("declares a Permissions-Policy header on the global rule with the design directive list", () => {
    const globalRule = vercel.headers.find((h) => h.source === "/(.*)");
    expect(globalRule).toBeDefined();

    const permissionsPolicy = globalRule?.headers.find(
      (h) => h.key === "Permissions-Policy",
    );
    expect(permissionsPolicy).toBeDefined();

    for (const directive of PERMISSIONS_POLICY_DIRECTIVES) {
      expect(permissionsPolicy?.value).toContain(directive);
    }
  });
});

describe("index.html — dead meta tags removed", () => {
  it("has no Permissions-Policy meta tag (browsers ignore it as a meta http-equiv)", () => {
    expect(indexHtml).not.toMatch(/http-equiv="Permissions-Policy"/);
  });

  it("has no X-Content-Type-Options meta tag (already a real header in vercel.json)", () => {
    expect(indexHtml).not.toMatch(/http-equiv="X-Content-Type-Options"/);
  });

  it("has no X-UA-Compatible meta tag (dead, IE-only)", () => {
    expect(indexHtml).not.toMatch(/http-equiv="X-UA-Compatible"/);
  });
});

describe("index.html — <meta charset> is the first child of <head>", () => {
  it("charset precedes every other head child", () => {
    const headMatch = indexHtml.match(/<head>([\s\S]*?)<\/head>/);
    expect(headMatch).not.toBeNull();
    const headContent = headMatch![1];

    // First tag-like token inside <head> (ignoring whitespace) must be the
    // charset meta — comments are not elements.
    const firstTagMatch = headContent.match(/<[a-zA-Z][^>]*>/);
    expect(firstTagMatch).not.toBeNull();
    expect(firstTagMatch![0]).toMatch(/^<meta charset="UTF-8"\s*\/?>$/);
  });
});

describe("index.html — Consent Mode comment is accurate", () => {
  it("documents that gtag.js still loads and may send cookieless pings before opt-in", () => {
    // The old comment ("nothing measured until explicit opt-in") implied gtag.js
    // does not run at all pre-consent, which is not true: the script loads and
    // dataLayer pushes happen unconditionally, only *_storage consent is denied.
    expect(indexHtml).toMatch(/gtag\.js.*(loads|cookieless)/is);
    expect(indexHtml).toMatch(/no analytics cookies/i);
  });
});
