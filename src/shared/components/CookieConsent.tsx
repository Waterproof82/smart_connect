/**
 * Cookie Consent (container)
 *
 * Clean Architecture: Shared Presentational Component
 *
 * Mounted once in both entry files. Picks banner / reopener / null based
 * on `useConsent().status` and on `window.__scAnalyticsScope` (single
 * source of truth set synchronously by the inline script in `index.html`,
 * see design.md A2 — avoids duplicating the `/admin|/panel|/login` regex
 * in TypeScript, which is exactly the WebMCP route-allowlist drift this
 * design explicitly avoids).
 *
 * `status === "unknown"` (server render AND first client render, per
 * `ConsentContext`) always renders null — no hydration mismatch possible.
 */

import React from "react";
import { useConsent } from "../context/ConsentContext";
import { useLanguage } from "../context/LanguageContext";
import { CookieBanner } from "./CookieBanner";

declare global {
  interface Window {
    __scAnalyticsScope?: boolean;
  }
}

const REOPENER_CLASS =
  "fixed bottom-4 left-4 z-[250] w-11 h-11 rounded-full flex items-center justify-center bg-[var(--color-bg)] border border-[var(--color-border)] text-default shadow-lg hover:bg-[var(--color-border)]/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]";

export const CookieConsent: React.FC = () => {
  const { status, acceptAll, rejectAll, reopen } = useConsent();
  const { t } = useLanguage();

  // /admin, /panel, /login never show the banner or reopener, even if the
  // user previously consented on a public route (design.md A2 + spec).
  if (typeof window !== "undefined" && window.__scAnalyticsScope === false) {
    return null;
  }

  if (status === "unknown") return null;

  if (status === "pending") {
    return (
      <CookieBanner
        onAccept={acceptAll}
        onReject={rejectAll}
        policyHref="/legal/cookies"
        labels={{
          title: t.cookieBannerTitle,
          body: t.cookieBannerBody,
          accept: t.cookieBannerAccept,
          reject: t.cookieBannerReject,
          policy: t.cookieBannerPolicy,
        }}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={reopen}
      aria-label={t.cookieReopenerLabel}
      title={t.cookieReopenerLabel}
      className={REOPENER_CLASS}
    >
      <span aria-hidden="true">🍪</span>
    </button>
  );
};

export default CookieConsent;
