import fs from "node:fs";
import path from "node:path";
import { BLOG_POSTS } from "../../../src/features/landing/data/blogPosts";
import { PRERENDERED_PATHS } from "../../../src/shared/routing/prerenderedRoutes";

/**
 * Search Console keyword alignment (2026-10-23): the queries with
 * impressions (tpv táctil / tpv tenerife / pizzerías, chatbot por isla,
 * Canarias Digitaliza) must be answered by visible copy, and the public
 * navigation must not expose /admin.
 */
const SRC = path.resolve(__dirname, "../../../src");
const read = (relPath: string) =>
  fs.readFileSync(path.join(SRC, relPath), "utf-8");
const COMPONENTS = "features/landing/presentation/components";

const seoCopy = read("shared/i18n/modules/seo-landing.ts");
const pageCopy = read("shared/i18n/modules/page-copy.ts");
const lang = read("shared/context/LanguageContext.tsx");

describe("home H1 matches the <title> (TPV, carta digital, chatbot)", () => {
  it("title names TPV, carta digital and chatbot con IA", () => {
    expect(read("App.tsx")).toMatch(
      /PAGE_TITLE =\s*"Digitaliza Tenerife \| TPV, carta digital y chatbot con IA"/,
    );
  });
  it("H1 copy names the same three services", () => {
    expect(lang).toMatch(/heroTitle: "TPV, carta digital y chatbot con IA"/);
  });
});

describe("home hub: product images and keyword anchors", () => {
  const hub = read(`${COMPONENTS}/HomeSolutionsSection.tsx`);
  it("renders real <img> with alt, intrinsic size and lazy loading", () => {
    expect(hub).toMatch(/<img\b/);
    expect(hub).toMatch(/alt=\{image\.alt\}/);
    expect(hub).toMatch(/width=\{image\.width\}/);
    expect(hub).toMatch(/height=\{image\.height\}/);
    expect(hub).toMatch(/loading="lazy"/);
  });
  it("does not use the NFC supplier photo on home (rights not verified, F-07)", () => {
    expect(hub).not.toMatch(/Tarjeta_NFC_negra_MontesTAP/);
  });
  it("TPV and carta anchors carry the keyword, not 'Ver el TPV'", () => {
    expect(pageCopy).not.toMatch(/"Ver el TPV"/);
    expect(pageCopy).toMatch(/tpvCardCta: "TPV táctil para hostelería en Tenerife"/);
    expect(pageCopy).toMatch(/cartaTeaserCta: "Carta digital para restaurantes sin comisiones"/);
  });
});

describe("public navigation does not expose /admin or the stale reviews anchor", () => {
  const navbar = read(`${COMPONENTS}/Navbar.tsx`);
  it("Navbar has no link to /admin", () => {
    expect(navbar).not.toMatch(/to="\/admin"/);
    expect(navbar).not.toMatch(/href="\/admin"/);
  });
  it("home no longer renders the 2022 QR iBar reviews, Navbar no longer links #exito", () => {
    expect(read("App.tsx")).not.toMatch(/<CartaDigitalReviews/);
    expect(navbar).not.toMatch(/#exito/);
  });
  it("/carta-digital keeps its (contextualised) reviews", () => {
    expect(read(`${COMPONENTS}/CartaDigitalPage.tsx`)).toMatch(
      /<CartaDigitalReviews/,
    );
  });
});

describe("/tpv-restaurantes covers the queried variants", () => {
  const page = read(`${COMPONENTS}/TpvRestaurantesPage.tsx`);
  it("title, description and H1 say 'TPV táctil'", () => {
    expect(page).toMatch(/PAGE_TITLE =\s*"TPV táctil/);
    expect(page).toMatch(/PAGE_DESCRIPTION =\s*"TPV táctil en Tenerife/);
    expect(pageCopy).toMatch(/tpvH1: "TPV táctil para restaurantes en Tenerife/);
  });
  it("has an H2 per 'táctil + Tenerife' and sector sections", () => {
    expect(page).toMatch(/t\.tpvTactilTitle/);
    expect(page).toMatch(/t\.tpvSectorsTitle/);
    expect(seoCopy).toMatch(/tpvTactilTitle: "TPV táctil en Tenerife/);
    for (const word of ["pizzerías", "bares", "restaurantes", "comercio"]) {
      expect(seoCopy).toContain(word);
    }
  });
  it("does not mention supermarkets (out of scope)", () => {
    expect(seoCopy).not.toMatch(/supermercad|supermarket/i);
  });
});

describe("/ia-chatbots-tenerife covers the other islands with distinct copy", () => {
  const page = read(`${COMPONENTS}/IaChatbotsPage.tsx`);
  it("renders Tenerife, Lanzarote and Fuerteventura sections", () => {
    expect(page).toMatch(/t\.iaIslandLzTitle/);
    expect(page).toMatch(/t\.iaIslandFvTitle/);
    expect(seoCopy).toMatch(/iaIslandsTitle: "Chatbot con IA en Tenerife, Lanzarote y Fuerteventura"/);
  });
  it("island descriptions are not duplicates of each other", () => {
    const descs = [...seoCopy.matchAll(/iaIsland(?:Tf|Lz|Fv)Desc:\s*\n?\s*"([^"]+)"/g)]
      .map((m) => m[1])
      .filter((_, i) => i < 3);
    expect(new Set(descs).size).toBe(3);
  });
  it("Service JSON-LD areaServed lists the islands shown on the page", () => {
    expect(page).toMatch(/areaServed=\{\["Tenerife", "Lanzarote", "Fuerteventura", "Canarias"\]\}/);
  });
});

describe("Canarias Digitaliza disambiguation (home FAQ + /about)", () => {
  it("home FAQ answers it and the FAQPage source includes it", () => {
    expect(seoCopy).toMatch(/homeFaqQ7: "¿Digitaliza Tenerife es lo mismo que Canarias Digitaliza\?"/);
    expect(read(`${COMPONENTS}/HomeFaqSection.tsx`)).toMatch(/t\.homeFaqQ7/);
  });
  it("never claims to belong to the public programme", () => {
    expect(seoCopy).toMatch(/del que no formamos parte/);
    expect(read(`${COMPONENTS}/AboutPage.tsx`)).toMatch(/del que no formamos parte/);
  });
  it("/about names both and links the four services with keyword anchors", () => {
    const about = read(`${COMPONENTS}/AboutPage.tsx`);
    expect(about).toMatch(/Canarias Digitaliza/);
    for (const href of ["/tpv-restaurantes", "/carta-digital", "/ia-chatbots-tenerife", "/tarjetas-nfc"]) {
      expect(about).toContain(`to="${href}"`);
    }
  });
});

describe("blog (4 articles, no invented data)", () => {
  const posts = read("features/landing/data/blogPosts.ts");
  const slugs = BLOG_POSTS.map((post) => post.slug);

  it("has 4 articles; every slug has a matching /blog/<slug> entry in the shared prerendered table, both directions (design.md shared-app-shell)", () => {
    expect(slugs).toHaveLength(4);
    const blogArticlePaths = PRERENDERED_PATHS.filter((p) =>
      p.startsWith("/blog/"),
    );
    expect(blogArticlePaths).toHaveLength(4);

    // post -> route: no article is missing its SSR/prerendered path.
    for (const slug of slugs) {
      expect(PRERENDERED_PATHS).toContain(`/blog/${slug}`);
    }
    // route -> post: no table entry serves a soft 404 (a NotFound page
    // returned with 200) because its slug has no matching article.
    for (const blogPath of blogArticlePaths) {
      const slug = blogPath.slice("/blog/".length);
      expect(slugs).toContain(slug);
    }
    expect(PRERENDERED_PATHS).toContain("/blog");
  });
  it("descriptions fit a SERP snippet (<= 155 chars)", () => {
    for (const m of posts.matchAll(/description:\s*\n?\s*"([^"]+)"/g)) {
      expect(m[1].length).toBeLessThanOrEqual(155);
    }
  });
  it("each article links its service page with a keyword anchor", () => {
    expect(posts).toMatch(/to: "\/tpv-restaurantes"/);
    expect(posts).toMatch(/to: "\/carta-digital"/);
    expect(posts).toMatch(/to: "\/ia-chatbots-tenerife"/);
    expect(posts).toMatch(/to: "\/tarjetas-nfc"/);
  });
  it("the TPV price article gives no price figure", () => {
    const start = posts.indexOf('slug: "cuanto-cuesta-un-tpv-restaurante"');
    const end = posts.indexOf('slug: "tarjetas-nfc', start);
    expect(posts.slice(start, end)).not.toMatch(/\d+\s?(€|euros)/);
  });
  it("footer links the blog", () => {
    expect(read("shared/components/SiteFooter.tsx")).toMatch(/to="\/blog"/);
  });
});
