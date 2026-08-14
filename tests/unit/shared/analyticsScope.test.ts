/**
 * isPublicAnalyticsPath — pure, independently testable guard deciding
 * whether GA4 is allowed to load on a given route.
 *
 * `index.html`'s inline consent script mirrors this exact regex (it can't
 * import a TS module — it's plain HTML), so this is the source of truth
 * `indexHtml.consentMode.structure.test.ts` cross-checks against. Keep both
 * in sync manually; that test asserts the mirrored regex textually matches.
 */
import { isPublicAnalyticsPath } from "@shared/utils/analyticsScope";

describe("isPublicAnalyticsPath", () => {
  it("returns true for public marketing routes", () => {
    expect(isPublicAnalyticsPath("/")).toBe(true);
    expect(isPublicAnalyticsPath("/tarjetas-nfc")).toBe(true);
    expect(isPublicAnalyticsPath("/about")).toBe(true);
    expect(isPublicAnalyticsPath("/legal/cookies")).toBe(true);
  });

  it("returns false for /admin and its sub-paths", () => {
    expect(isPublicAnalyticsPath("/admin")).toBe(false);
    expect(isPublicAnalyticsPath("/admin/")).toBe(false);
    expect(isPublicAnalyticsPath("/admin/settings")).toBe(false);
  });

  it("returns false for /panel and /login and their sub-paths", () => {
    expect(isPublicAnalyticsPath("/panel")).toBe(false);
    expect(isPublicAnalyticsPath("/panel/users")).toBe(false);
    expect(isPublicAnalyticsPath("/login")).toBe(false);
    expect(isPublicAnalyticsPath("/login/reset")).toBe(false);
  });

  it("does NOT false-positive on routes that merely start with the same letters", () => {
    // The bug this guards against: a naive prefix check (not anchored with
    // (\/|$)) would also match /administrator, /panelcita, /loginfo, etc.
    expect(isPublicAnalyticsPath("/administrator")).toBe(true);
    expect(isPublicAnalyticsPath("/panelcita")).toBe(true);
    expect(isPublicAnalyticsPath("/loginfo")).toBe(true);
  });
});
