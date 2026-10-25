import type { ReactElement } from "react";
import { Suspense, lazy } from "react";
import { describe, expect, it, vi } from "vitest";
import { render as rtlRender, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "@shared/context/ThemeContext";
import { LanguageProvider } from "@shared/context/LanguageContext";
import { ConsentProvider } from "@shared/context/ConsentContext";
import { ScrollToTop } from "@shared/components/ScrollToTop";
import { CookieConsent } from "@shared/components/CookieConsent";
import { AppShell } from "../shared/presentation/AppShell";

// jsdom has no IntersectionObserver; PageShell/CookieBanner chains use it
// for nav/visibility state (see NotFound.test.tsx for the same rationale).
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = "";
  readonly thresholds: ReadonlyArray<number> = [];
  disconnect = vi.fn();
  observe = vi.fn();
  takeRecords = vi.fn(() => []);
  unobserve = vi.fn();
}

const unwrap = (el: ReactElement) =>
  (el.props as { children: ReactElement | ReactElement[] }).children;

describe("AppShell (shared-app-shell PR2, Shared AppShell Provider Tree)", () => {
  it("nests providers in spec order: Helmet > Theme > Language > Consent > [ScrollToTop, CookieConsent, Suspense(children)] — pure element-tree walk, zero hooks run", () => {
    const marker = <div data-testid="child" /> as ReactElement;

    const helmetEl = AppShell({ children: marker }) as ReactElement;
    expect(helmetEl.type).toBe(HelmetProvider);

    const themeEl = unwrap(helmetEl) as ReactElement;
    expect(themeEl.type).toBe(ThemeProvider);

    const languageEl = unwrap(themeEl) as ReactElement;
    expect(languageEl.type).toBe(LanguageProvider);

    const consentEl = unwrap(languageEl) as ReactElement;
    expect(consentEl.type).toBe(ConsentProvider);

    const consentChildren = unwrap(consentEl) as ReactElement[];
    expect(consentChildren).toHaveLength(3);
    expect(consentChildren[0].type).toBe(ScrollToTop);
    expect(consentChildren[1].type).toBe(CookieConsent);
    expect(consentChildren[2].type).toBe(Suspense);
    expect(consentChildren[2].props.children).toBe(marker);
  });

  it("Router stays outside AppShell (AppShell renders no router of its own)", () => {
    const tree = AppShell({ children: <div /> }) as ReactElement;
    expect(tree.type).not.toBe(MemoryRouter);
  });
});

describe("AppShell — Suspense fallback (mounted smoke)", () => {
  it("shows the fallback while a lazy child is pending, then the resolved child", async () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
    globalThis.IntersectionObserver =
      MockIntersectionObserver as unknown as typeof IntersectionObserver;

    let resolveImport!: () => void;
    const LazyChild = lazy(
      () =>
        new Promise<{ default: React.FC }>((resolve) => {
          resolveImport = () =>
            resolve({ default: () => <div data-testid="lazy-child">Loaded</div> });
        }),
    );

    rtlRender(
      <MemoryRouter>
        <AppShell fallback={<div data-testid="fallback">Loading…</div>}>
          <LazyChild />
        </AppShell>
      </MemoryRouter>,
    );

    expect(screen.getByTestId("fallback")).toBeInTheDocument();
    resolveImport();
    await screen.findByTestId("lazy-child");
  });
});
