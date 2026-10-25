import { describe, expect, it } from "vitest";
import { render } from "../entry-server";

/**
 * Helmet Context Threading — "Missing context on server crashes loudly"
 * (design.md shared-app-shell). Runs under the repo's default jsdom
 * environment on purpose: with a `window` present at import time,
 * `react-helmet-async` treats the render as client-side and never fills
 * `helmetContext.helmet`. That is exactly the "never populated" case —
 * `render()` must throw instead of returning an empty `<head>` that would
 * ship prerendered pages without title, meta or canonical.
 */
describe("entry-server render() — unpopulated helmetContext", () => {
  it("throws instead of returning an empty head", () => {
    expect(() => render("/")).toThrow(TypeError);
  });
});
