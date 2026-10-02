import { createElement, Suspense, type ComponentType } from "react";
import { renderToString } from "react-dom/server";
import { preloadable } from "../../src/clientRoutes";

// design.md D1 (seo-audit-followups, S1): preloadable() memoizes one
// loader promise and renders the RESOLVED component directly once
// preload() has settled, instead of going through React.lazy's
// throw-a-promise Suspense path. That is what makes hydration never
// suspend for a route that was preloaded before hydrateRoot — the
// root cause of React error #421 on /carta-digital, /tarjetas-nfc and
// /tpv-restaurantes.
describe("preloadable() (design.md D1, S1)", () => {
  it("memoizes the loader: calling preload() twice invokes the loader function once", async () => {
    let calls = 0;
    const route = preloadable(() => {
      calls += 1;
      return Promise.resolve({ default: (() => null) as ComponentType });
    });

    await route.preload();
    await route.preload();

    expect(calls).toBe(1);
  });

  it("Component renders the Suspense fallback before preload() resolves", async () => {
    let resolveLoad!: (mod: { default: ComponentType }) => void;
    const route = preloadable(
      () =>
        new Promise((resolve) => {
          resolveLoad = resolve;
        }),
    );
    const Fallback = () => createElement("div", null, "loading-fallback");
    const Marker = () => createElement("div", null, "resolved-content");

    const tree = createElement(
      Suspense,
      { fallback: createElement(Fallback) },
      createElement(route.Component),
    );

    // Not preloaded yet — renderToString's legacy Suspense support
    // renders the fallback synchronously for an unresolved child.
    const htmlBeforeResolve = renderToString(tree);
    expect(htmlBeforeResolve).toContain("loading-fallback");
    expect(htmlBeforeResolve).not.toContain("resolved-content");

    resolveLoad({ default: Marker });
    // Let the loader promise's .then() run.
    await Promise.resolve();
    await Promise.resolve();

    const htmlAfterResolve = renderToString(tree);
    expect(htmlAfterResolve).toContain("resolved-content");
  });

  it("renders the resolved component directly, with no Suspense boundary required, once preload() has settled", async () => {
    const Marker = () => createElement("div", null, "resolved-content");
    const route = preloadable(() => Promise.resolve({ default: Marker }));

    await route.preload();

    // No <Suspense> wrapper here on purpose: if the resolved branch
    // still went through React.lazy, an unwrapped throw would make
    // renderToString itself throw instead of returning HTML.
    const html = renderToString(createElement(route.Component));

    expect(html).toContain("resolved-content");
  });
});
