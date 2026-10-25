// @vitest-environment node
import { describe, expect, it } from "vitest";
import { render } from "../entry-server";

/**
 * Render-based half of the vercelNotFound guard (design.md shared-app-shell,
 * notFound Option and 404 Output Unchanged). The structural half (vercel.json
 * rewrites, prerender.mjs's `render("/404", { notFound: true })` call, the
 * component source declaring `noindex`) stays in Jest —
 * `tests/unit/scripts/vercelNotFound.test.ts`. This file instead calls the
 * real `render()` the way `scripts/prerender.mjs` does, and asserts on the
 * actual output instead of a source regex.
 *
 * `@vitest-environment node`: see `ssrHydrationParity.test.tsx`'s file
 * comment — `render()` needs no `window` present at import time for
 * `react-helmet-async` to populate its server-side helmet context.
 */
describe('entry-server render("/404", { notFound: true }) — real output', () => {
  it("renders the NotFound page's h1 and noindex meta", () => {
    const { html, head } = render("/404", { notFound: true });

    expect(html).toMatch(/<h1[^>]*>404<\/h1>/);
    expect(head).toMatch(/name="robots" content="noindex, nofollow"/);
  });

  it("does not render the normal route table (no page other than NotFound mounts)", () => {
    const { html: notFoundHtml } = render("/404", { notFound: true });
    const { html: homeHtml } = render("/");

    expect(notFoundHtml).not.toBe(homeHtml);
  });
});
