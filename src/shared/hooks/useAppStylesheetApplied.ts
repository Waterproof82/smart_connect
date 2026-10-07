/**
 * useAppStylesheetApplied Hook
 * @module shared/hooks
 *
 * Returns `false` during SSR and the first client render, then flips to
 * `true` once the deferred app stylesheet (`scripts/critical-css.mjs`'s
 * `deferStylesheetLink` swap) has been applied — see
 * `@shared/utils/appStylesheet`'s `onAppStylesheetApplied` for the actual
 * detection logic. Used to gate mounting fixed-position post-hydration
 * widgets (`CookieConsent`, `DeferredExpertAssistant`) so they never
 * render with only the critical CSS applied, which would be missing
 * their `position: fixed` geometry (design.md D4, SDD `font-stability`
 * PR3).
 */
import { useEffect, useState } from "react";

import { onAppStylesheetApplied } from "@shared/utils/appStylesheet";

export function useAppStylesheetApplied(): boolean {
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    if (applied) return;
    return onAppStylesheetApplied(() => setApplied(true));
  }, [applied]);

  return applied;
}
