// @vitest-environment node
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { render } from "../entry-server";
import {
  BLOG_BASE_PATH,
  BLOG_INDEX_OG_IMAGE,
  BLOG_POSTS,
  blogOgImage,
} from "../features/landing/data/blogPosts";

const ORIGIN = "https://digitalizatenerife.es";

// PNG IHDR: width and height are big-endian uint32 at bytes 16 and 20.
function pngSize(file: string): { width: number; height: number } {
  const buf = readFileSync(file);
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

const publicFile = (urlPath: string) => join(process.cwd(), "public", urlPath);

describe("blog Open Graph images", () => {
  it.each(BLOG_POSTS.map((p) => [p.slug]))(
    "%s publishes its own 1200x630 OG image",
    (slug) => {
      const image = blogOgImage(slug);
      const { head } = render(`${BLOG_BASE_PATH}/${slug}`);

      expect(head).toContain(`property="og:image" content="${ORIGIN}${image}"`);
      expect(head).toContain(`name="twitter:image" content="${ORIGIN}${image}"`);
      expect(head).toContain(`"image":"${ORIGIN}${image}"`);
      expect(existsSync(publicFile(image))).toBe(true);
      expect(pngSize(publicFile(image))).toEqual({ width: 1200, height: 630 });
    },
  );

  it("the /blog index publishes the blog OG image", () => {
    const { head } = render(BLOG_BASE_PATH);

    expect(head).toContain(`property="og:image" content="${ORIGIN}${BLOG_INDEX_OG_IMAGE}"`);
    expect(head).toContain(`name="twitter:image" content="${ORIGIN}${BLOG_INDEX_OG_IMAGE}"`);
    expect(pngSize(publicFile(BLOG_INDEX_OG_IMAGE))).toEqual({ width: 1200, height: 630 });
  });

  it("no two articles share an OG image", () => {
    const images = BLOG_POSTS.map((p) => blogOgImage(p.slug));
    expect(new Set(images).size).toBe(images.length);
  });
});
