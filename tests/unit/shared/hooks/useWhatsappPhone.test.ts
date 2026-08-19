jest.mock("@shared/supabaseClient", () => ({
  getSupabase: jest.fn().mockResolvedValue({
    from: jest.fn(),
  }),
}));

import { sanitizeWhatsappPhone } from "@shared/hooks/useWhatsappPhone";

// NOTE: `useWhatsappPhone` itself is a React hook (useState/useEffect) that
// wraps `getAppSettings()`. This project's jest config runs tests in a
// Node environment without `jest-environment-jsdom` installed, so React
// Testing Library's `render`/`renderHook` cannot mount components here
// (pre-existing repo constraint, not introduced by this change — see
// apply-progress notes). We therefore unit-test the pure formatting logic
// the hook depends on directly, and rely on `tsc --noEmit` + the single
// call site in App.tsx to validate the hook wiring itself.
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
