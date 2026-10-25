// @vitest-environment node
import { describe, expect, it } from "vitest";
import { render } from "../entry-server";
import { BLOG_BASE_PATH, BLOG_POSTS } from "../features/landing/data/blogPosts";

const servicePaths = [...new Set(BLOG_POSTS.map((post) => post.cta.to))];

const relatedBlock = (html: string): string => {
  const start = html.indexOf('id="related-articles"');
  if (start === -1) return "";
  return html.slice(start, html.indexOf("</section>", start));
};

describe("Related articles on service pages", () => {
  it("every article's CTA points to a prerendered service page", () => {
    for (const path of servicePaths) {
      expect(render(path).html).not.toMatch(/<h1[^>]*>404<\/h1>/);
    }
  });

  it.each(servicePaths.map((path) => [path]))(
    "%s links every article whose CTA points to it, and no other",
    (path) => {
      const block = relatedBlock(render(path).html);
      expect(block).toContain("Lee también");

      for (const post of BLOG_POSTS) {
        const href = `href="${BLOG_BASE_PATH}/${post.slug}"`;
        if (post.cta.to === path) {
          expect(block).toContain(href);
        } else {
          expect(block).not.toContain(href);
        }
      }
    },
  );

  it("pages without related articles render no block", () => {
    expect(relatedBlock(render("/about").html)).toBe("");
  });
});
