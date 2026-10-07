/**
 * appStylesheet Utility
 * @module shared/utils/appStylesheet
 *
 * Detects when the deferred, non-critical app stylesheet (the
 * `<link media="print" onload="this.media='all'">` swap written by
 * `scripts/critical-css.mjs`'s `deferStylesheetLink`) has finished
 * applying, so fixed-position post-hydration widgets (CookieConsent,
 * `DeferredExpertAssistant`) can stay unmounted until their real geometry
 * is actually available — see design.md "Data Flow (PR3)".
 *
 * `onAppStylesheetApplied` takes an injectable `doc` so it is unit
 * testable under this repo's Jest config (`testEnvironment: "node"`, no
 * jsdom — see `appStylesheet.test.ts`) without ever touching a real DOM.
 * `useAppStylesheetApplied` (the hook built on top of this) always calls
 * it with the real `document`, from inside a `useEffect` (client-only).
 */

/**
 * The minimal `<link>` surface this module needs — satisfied structurally
 * by a real `HTMLLinkElement`, and by a hand-written fake in tests.
 */
export interface AppStylesheetLinkLike {
  media: string;
  sheet: unknown;
  addEventListener(type: "load" | "error", listener: () => void): void;
  removeEventListener(type: "load" | "error", listener: () => void): void;
}

/**
 * The minimal `document` surface this module needs — satisfied
 * structurally by a real `Document`, and by a hand-written fake in tests.
 */
export interface AppStylesheetDocumentLike {
  querySelector(selector: string): AppStylesheetLinkLike | null;
}

/**
 * Matches the ONE `<link>` `scripts/critical-css.mjs`'s `deferStylesheetLink`
 * defers for a given route: a same-origin `/assets/*.css` stylesheet still
 * sitting at `media="print"` (not yet swapped to `"all"` by its `onload`).
 * A route with no SSR critical-CSS pass (e.g. `dist/_spa.html`, design.md
 * Decision 2) has no such link — its stylesheet is a plain blocking
 * `<link>`, which this selector correctly does NOT match.
 */
export const APP_STYLESHEET_DEFERRED_SELECTOR =
  'link[rel="stylesheet"][href^="/assets/"][media="print"]';

/**
 * Calls `callback` once the deferred app stylesheet has been applied
 * (loaded OR errored — either way the browser has finished with it), or
 * immediately/synchronously when there is nothing to wait for:
 * - no matching link at all (no-SSR `_spa.html`, or dev), or
 * - the link already finished (`link.sheet` is set, or its `media` already
 *   swapped away from `"print"`) — covers the race where this runs after
 *   the `onload` swap already fired.
 *
 * Returns a cleanup function that detaches any listeners it attached
 * (a no-op if it never attached any).
 */
export function onAppStylesheetApplied(
  callback: () => void,
  doc: AppStylesheetDocumentLike = document,
): () => void {
  const link = doc.querySelector(APP_STYLESHEET_DEFERRED_SELECTOR);

  if (!link || link.sheet || link.media !== "print") {
    callback();
    return () => {};
  }

  let settled = false;
  const markApplied = () => {
    if (settled) return;
    settled = true;
    callback();
  };

  link.addEventListener("load", markApplied);
  link.addEventListener("error", markApplied);

  return () => {
    link.removeEventListener("load", markApplied);
    link.removeEventListener("error", markApplied);
  };
}
