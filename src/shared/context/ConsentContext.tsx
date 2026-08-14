/**
 * Consent Context
 *
 * Clean Architecture: Shared Context Layer
 *
 * Cookie consent state (RGPD art.6 / LSSI-CE art.22.2). SSR-safe: the
 * initial state is the fixed literal "unknown" on both the server render
 * and the first client render (mirrors `ThemeContext.tsx`'s pattern) so
 * hydration markup always matches — no React error #418. Post-hydration,
 * a `useEffect([])` reads the real stored consent via the pure
 * `consentStorage` module and corrects the state.
 *
 * PR2a scope: storage + context only. The banner/reopener UI
 * (`CookieBanner`/`CookieConsent`) and entry-file wiring are a separate
 * batch — this provider is intentionally unused/unmounted until then.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { readConsent, buildConsent, writeConsent } from "../utils/consentStorage";

export type ConsentStatus = "unknown" | "pending" | "decided";

interface ConsentContextValue {
  /** "unknown" on server AND first client render — mandatory for #418. */
  status: ConsentStatus;
  /** false unless the user has explicitly granted analytics. */
  analytics: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  reopen: () => void;
}

const ConsentContext = createContext<ConsentContextValue | undefined>(
  undefined,
);

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const notifyGtagConsent = (analytics: boolean): void => {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("consent", "update", {
      analytics_storage: analytics ? "granted" : "denied",
    });
  }
};

export const ConsentProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Fixed initial value on server and first client render — mandatory for #418.
  const [status, setStatus] = useState<ConsentStatus>("unknown");
  const [analytics, setAnalytics] = useState<boolean>(false);

  // Post-hydration only: read the stored consent and correct state.
  // Runs once on mount — never during render.
  useEffect(() => {
    const record = readConsent();
    if (record) {
      setStatus("decided");
      setAnalytics(record.categories.analytics);
    } else {
      setStatus("pending");
    }
  }, []);

  const acceptAll = useCallback(() => {
    const record = buildConsent(true);
    writeConsent(record);
    setStatus("decided");
    setAnalytics(true);
    notifyGtagConsent(true);
  }, []);

  const rejectAll = useCallback(() => {
    const record = buildConsent(false);
    writeConsent(record);
    setStatus("decided");
    setAnalytics(false);
    notifyGtagConsent(false);
  }, []);

  const reopen = useCallback(() => {
    setStatus("pending");
  }, []);

  const value = useMemo(
    () => ({ status, analytics, acceptAll, rejectAll, reopen }),
    [status, analytics, acceptAll, rejectAll, reopen],
  );

  return (
    <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
  );
};

export const useConsent = (): ConsentContextValue => {
  const context = useContext(ConsentContext);
  if (!context) {
    throw new Error("useConsent must be used within a ConsentProvider");
  }
  return context;
};
