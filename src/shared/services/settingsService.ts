/**
 * Settings Service
 *
 * Shared service to fetch application settings. Used by the Landing page
 * (WhatsApp CTA, Contact) to display dynamic contact information.
 *
 * S5 (SDD `landing-main-thread-tbt`): reads the public `app_settings` row
 * via a plain PostgREST `fetch` (anon key — RLS already allows public
 * `SELECT` on `app_settings`) instead of resolving the Supabase SDK client
 * (`getSupabase()`/`@shared/supabaseClient`). Public pages have no other
 * reason to request `vendor-supabase`, so this keeps that chunk off every
 * public route — it is only fetched later, lazily, if the user opens the
 * chatbot (see `ExpertAssistantWithRAG.tsx`). Do NOT reintroduce a static
 * or dynamic import of `@supabase/supabase-js`/`@shared/supabaseClient`
 * here — `tests/unit/shared/settingsServiceNoVendorSupabase.guard.test.ts`
 * guards against that regression.
 *
 * One in-flight/resolved request per page load, shared by every consumer
 * (`useWhatsappPhone`, `Contact.tsx`) via `memoizeAsync` — a rejected
 * fetch is NOT cached, so the next call retries from scratch instead of
 * permanently bricking every consumer on a transient failure.
 *
 * sdd/notify-lead-antibot (D1): `anon` lost table-level SELECT on
 * `app_settings` and only has column-level grants on the public columns
 * below. `select=*` FAILS under column grants, so this MUST always use
 * an explicit column list — guarded by a regression test in
 * `tests/unit/shared/settingsService.test.ts`. `n8n_enabled`/
 * `n8n_webhook_url` are intentionally NOT in the allow-list: the browser
 * no longer needs them (notify-lead resolves routing server-side with
 * the service role).
 */

import { ENV } from "@shared/config/env.config";
import { memoizeAsync } from "@shared/utils/memoizeAsync";

const PUBLIC_COLUMNS = "id,contact_email,whatsapp_phone,physical_address";

export interface AppSettings {
  contactEmail: string;
  whatsappPhone: string;
  physicalAddress: string;
}

const SETTINGS_FETCH_TIMEOUT_MS = 5000;

function isSettingsRow(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function mapSettingsRow(row: Record<string, unknown>): AppSettings {
  return {
    contactEmail: (row.contact_email as string) || "",
    whatsappPhone: (row.whatsapp_phone as string) || "",
    physicalAddress: (row.physical_address as string) || "",
  };
}

/**
 * Returns default settings — used both as the public fallback (network
 * error, non-OK response, missing env vars, unexpected shape) and when no
 * `app_settings` row exists.
 */
function getDefaultSettings(): AppSettings {
  return {
    contactEmail: "",
    whatsappPhone: "",
    physicalAddress: "",
  };
}

/**
 * Raw fetcher — throws on any failure (missing env vars, network error,
 * timeout, non-OK response, unexpected shape). Never called directly by
 * consumers; always wrapped by the memoized cache below so a rejection
 * clears the cache instead of poisoning it.
 */
async function fetchAppSettingsOrThrow(): Promise<AppSettings> {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = ENV;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      "Missing Supabase credentials. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.",
    );
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    SETTINGS_FETCH_TIMEOUT_MS,
  );

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/app_settings?id=eq.global&select=${PUBLIC_COLUMNS}`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch app settings: ${response.status}`);
    }

    const rows: unknown = await response.json();
    const row = Array.isArray(rows) ? rows[0] : undefined;

    if (!isSettingsRow(row)) {
      throw new Error("Unexpected app_settings response shape.");
    }

    return mapSettingsRow(row);
  } finally {
    clearTimeout(timeoutId);
  }
}

let getAppSettingsMemoized = memoizeAsync(fetchAppSettingsOrThrow);

/**
 * Fetches application settings. Resolves to `getDefaultSettings()` on any
 * failure (never rejects) — preserves the existing fallback contract for
 * every caller. Concurrent calls before the first resolves share a single
 * underlying `fetch` (see module doc).
 */
export async function getAppSettings(): Promise<AppSettings> {
  try {
    return await getAppSettingsMemoized();
  } catch (error) {
    console.warn("Error fetching app settings:", error);
    return getDefaultSettings();
  }
}

/** Test-only: clears the shared request cache. */
export function resetAppSettingsCache(): void {
  getAppSettingsMemoized = memoizeAsync(fetchAppSettingsOrThrow);
}
