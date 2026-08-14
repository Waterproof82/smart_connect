/**
 * Consent Storage
 * @module shared/utils/consentStorage
 *
 * Pure read/write/expiry/version rules for the cookie-consent record.
 * No React, no DOM coupling beyond an injectable `Storage` (defaults to
 * `localStorage` for real callers). Kept in sync with the inline
 * pre-hydration script in `index.html` (same key/version/max-age).
 *
 * Security/Privacy: RGPD art.6, LSSI-CE art.22.2 — consent must be
 * re-requested after 24 months or whenever the policy version changes.
 */

export const CONSENT_KEY = "sc_consent_v1";
export const VERSION = 1;
/** 24 months (730 days) in milliseconds. */
export const MAX_AGE_MS = 63072000000;

export interface ConsentCategories {
  necessary: true;
  analytics: boolean;
}

export interface ConsentRecord {
  version: number;
  timestamp: number;
  categories: ConsentCategories;
}

function isValidConsentRecord(value: unknown): value is ConsentRecord {
  if (typeof value !== "object" || value === null) return false;

  const record = value as Record<string, unknown>;
  if (typeof record.version !== "number") return false;
  if (typeof record.timestamp !== "number") return false;

  const categories = record.categories;
  if (typeof categories !== "object" || categories === null) return false;

  const { necessary, analytics } = categories as Record<string, unknown>;
  if (necessary !== true) return false;
  if (typeof analytics !== "boolean") return false;

  return true;
}

/**
 * Reads and validates the stored consent record.
 * Returns `null` when the record is absent, corrupt, malformed, from an
 * older policy version, or older than {@link MAX_AGE_MS} — any of these
 * cases means the user must be re-prompted.
 */
export function readConsent(storage: Storage = localStorage): ConsentRecord | null {
  let raw: string | null;
  try {
    raw = storage.getItem(CONSENT_KEY);
  } catch {
    // Storage access blocked (e.g. Safari private mode / disabled cookies).
    return null;
  }

  if (!raw) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!isValidConsentRecord(parsed)) return null;
  if (parsed.version !== VERSION) return null;
  if (Date.now() - parsed.timestamp >= MAX_AGE_MS) return null;

  return parsed;
}

/** Builds a fresh consent record for the current policy version. */
export function buildConsent(analytics: boolean): ConsentRecord {
  return {
    version: VERSION,
    timestamp: Date.now(),
    categories: { necessary: true, analytics },
  };
}

/**
 * Persists a consent record. Silently no-ops if storage is unavailable
 * (e.g. Safari private mode) — analytics simply stays denied for the
 * session, which is the safe default.
 */
export function writeConsent(
  record: ConsentRecord,
  storage: Storage = localStorage,
): void {
  try {
    storage.setItem(CONSENT_KEY, JSON.stringify(record));
  } catch {
    // Storage blocked — nothing to do, caller keeps its in-memory state.
  }
}
