// @vitest-environment node
import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import { Helmet, type HelmetServerState } from "react-helmet-async";
import { AppShell } from "../shared/presentation/AppShell";

/**
 * Helmet Context Threading — "Server passes helmetContext" (design.md
 * shared-app-shell). The object the server hands to AppShell must be the
 * one HelmetProvider fills. `@vitest-environment node`: see
 * ssrHydrationParity.test.tsx — react-helmet-async only fills the context
 * when no `window` exists at import time.
 */
describe("AppShell — helmetContext threading", () => {
  it("fills the exact helmetContext object it receives", () => {
    const helmetContext = {} as { helmet?: HelmetServerState };

    renderToString(
      <StaticRouter location="/">
        <AppShell helmetContext={helmetContext}>
          <Helmet>
            <title>Threading probe</title>
          </Helmet>
        </AppShell>
      </StaticRouter>,
    );

    expect(helmetContext.helmet?.title.toString()).toContain("Threading probe");
  });
});
