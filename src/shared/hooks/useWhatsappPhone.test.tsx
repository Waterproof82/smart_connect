/**
 * useWhatsappPhone Tests (behavioral)
 *
 * S5 (SDD `landing-main-thread-tbt`): the hook no longer keeps its own
 * `phonePromise` cache — it calls `settingsService.getAppSettings()`
 * directly and relies on settingsService's own shared promise cache
 * (`memoizeAsync`, tested in `tests/unit/shared/settingsService.test.ts`).
 * `resetWhatsappPhoneCache` now delegates to settingsService's
 * `resetAppSettingsCache` instead of clearing a local variable.
 *
 * Requires a real DOM + React render (jsdom), which this repo's Jest
 * config does not provide — routed to Vitest via `.tsx` + the
 * `src/shared/hooks/**` `vite.config.ts` include entry (same precedent as
 * `useIdleOrInteraction.test.tsx`).
 */
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  resetWhatsappPhoneCache,
  sanitizeWhatsappPhone,
  useWhatsappPhone,
} from "@shared/hooks/useWhatsappPhone";
import * as settingsService from "@shared/services/settingsService";

describe("useWhatsappPhone", () => {
  beforeEach(() => {
    vi.spyOn(settingsService, "resetAppSettingsCache");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns an empty string before settings resolve", () => {
    vi.spyOn(settingsService, "getAppSettings").mockReturnValue(
      new Promise(() => {}),
    );

    const { result } = renderHook(() => useWhatsappPhone());

    expect(result.current).toBe("");
  });

  it("resolves to the sanitized phone from settingsService.getAppSettings()", async () => {
    vi.spyOn(settingsService, "getAppSettings").mockResolvedValue({
      n8nWebhookUrl: "",
      n8nEnabled: false,
      contactEmail: "",
      whatsappPhone: "+34 601 39 64 19",
      physicalAddress: "",
    });

    const { result } = renderHook(() => useWhatsappPhone());

    await waitFor(() => expect(result.current).toBe("+34601396419"));
  });

  it("falls back to an empty string when getAppSettings() rejects", async () => {
    vi.spyOn(settingsService, "getAppSettings").mockRejectedValue(
      new Error("offline"),
    );

    const { result } = renderHook(() => useWhatsappPhone());

    // Give the rejected promise a tick to settle; state should stay "".
    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current).toBe("");
  });

  it("has no hook-level cache — N mounted consumers call getAppSettings() N times (dedup now lives in settingsService, not here)", async () => {
    const getAppSettingsSpy = vi
      .spyOn(settingsService, "getAppSettings")
      .mockResolvedValue({
        n8nWebhookUrl: "",
        n8nEnabled: false,
        contactEmail: "",
        whatsappPhone: "+34600000000",
        physicalAddress: "",
      });

    renderHook(() => useWhatsappPhone());
    renderHook(() => useWhatsappPhone());

    await waitFor(() => expect(getAppSettingsSpy).toHaveBeenCalledTimes(2));
  });

  it("resetWhatsappPhoneCache delegates to settingsService.resetAppSettingsCache", () => {
    resetWhatsappPhoneCache();

    expect(settingsService.resetAppSettingsCache).toHaveBeenCalledTimes(1);
  });
});

describe("sanitizeWhatsappPhone", () => {
  it("strips everything except digits and a leading +", () => {
    expect(sanitizeWhatsappPhone("+34 601 39 64 19")).toBe("+34601396419");
  });

  it("returns an empty string for empty input", () => {
    expect(sanitizeWhatsappPhone("")).toBe("");
  });

  it("removes parentheses and dashes", () => {
    expect(sanitizeWhatsappPhone("(34) 601-39-64-19")).toBe("34601396419");
  });
});
