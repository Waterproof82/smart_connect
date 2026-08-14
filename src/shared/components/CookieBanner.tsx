/**
 * Cookie Banner
 *
 * Clean Architecture: Shared Presentational Component
 *
 * First-layer consent UI (RGPD art.6 / LSSI-CE art.22.2). Purely
 * presentational — no state, no storage, no context reads. `CookieConsent`
 * (container) decides when to render this and wires the callbacks.
 *
 * AEPD requires Accept and Reject to be equally prominent, one-click
 * actions in the SAME first layer — no nested "configure" menu, no
 * pre-ticked boxes, no cookie-wall (site stays usable underneath). Accept
 * and Reject intentionally share the exact same `BUTTON_CLASS` constant;
 * only the label differs.
 */

import React from "react";

export interface CookieBannerLabels {
  title: string;
  body: string;
  accept: string;
  reject: string;
  policy: string;
}

export interface CookieBannerProps {
  onAccept: () => void;
  onReject: () => void;
  policyHref: string;
  labels: CookieBannerLabels;
}

const BUTTON_CLASS =
  "px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[var(--color-on-accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2";

export const CookieBanner: React.FC<CookieBannerProps> = ({
  onAccept,
  onReject,
  policyHref,
  labels,
}) => {
  return (
    <div
      role="region"
      aria-label={labels.title}
      className="fixed inset-x-0 bottom-0 z-[250] bg-[var(--color-bg)] border-t border-[var(--color-border)] px-6 py-5"
    >
      <div className="container mx-auto max-w-5xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-base font-semibold text-default mb-1">
            {labels.title}
          </h2>
          <p className="text-sm text-muted">
            {labels.body}{" "}
            <a
              href={policyHref}
              className="underline hover:text-[var(--color-accent)]"
            >
              {labels.policy}
            </a>
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button type="button" onClick={onReject} className={BUTTON_CLASS}>
            {labels.reject}
          </button>
          <button type="button" onClick={onAccept} className={BUTTON_CLASS}>
            {labels.accept}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
