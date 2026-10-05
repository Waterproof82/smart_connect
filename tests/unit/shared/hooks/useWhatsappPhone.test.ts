import { sanitizeWhatsappPhone } from "@shared/hooks/useWhatsappPhone";

// NOTE: `useWhatsappPhone` itself is a React hook (useState/useEffect) that
// wraps `settingsService.getAppSettings()`. This project's jest config runs
// tests in a Node environment without `jest-environment-jsdom` installed, so
// React Testing Library's `render`/`renderHook` cannot mount components here
// (pre-existing repo constraint, not introduced by this change — see
// apply-progress notes). We therefore unit-test the pure formatting logic
// the hook depends on directly here; the hook's render behavior (resolves
// the sanitized phone, falls back to "" on failure, no hook-level cache,
// `resetWhatsappPhoneCache` delegation) is covered under Vitest/jsdom in
// `src/shared/hooks/useWhatsappPhone.test.tsx` (S5, SDD
// `landing-main-thread-tbt` — the hook no longer imports
// `@shared/supabaseClient` at all, so that module no longer needs a mock
// here).
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
