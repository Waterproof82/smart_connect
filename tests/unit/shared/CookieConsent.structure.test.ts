/**
 * CookieConsent / CookieBanner structure test.
 *
 * Both are React components (`.tsx`) — Jest here is `testEnvironment: "node"`
 * with no `jest-environment-jsdom`, so behavioral RTL renders don't run
 * under this repo's testMatch (see `ConsentContext.structure.test.ts` for
 * the same rationale). Source-text assertions cover the AEPD/design.md
 * invariants that matter: equal Accept/Reject prominence, no pre-ticked
 * inputs, no cookie-wall, correct status→UI mapping, and the reopener's
 * bottom-left placement (chatbot owns bottom-right `z-[100]`).
 */

import fs from "node:fs";
import path from "node:path";

const SRC = path.resolve(__dirname, "../../../src");
const BANNER_PATH = path.join(SRC, "shared/components/CookieBanner.tsx");
const CONSENT_PATH = path.join(SRC, "shared/components/CookieConsent.tsx");

describe("CookieBanner (design.md: first-layer Accept/Reject parity)", () => {
  it("exists", () => {
    expect(fs.existsSync(BANNER_PATH)).toBe(true);
  });

  const readSource = () => fs.readFileSync(BANNER_PATH, "utf-8");

  it("is a presentational component with role=\"region\" and an aria-label", () => {
    const source = readSource();
    expect(source).toMatch(/role="region"/);
    expect(source).toMatch(/aria-label=/);
  });

  it("is positioned fixed inset-x-0 bottom-0 z-[250], no backdrop / no inset-0 overlay (no cookie-wall)", () => {
    const source = readSource();
    expect(source).toMatch(/fixed inset-x-0 bottom-0 z-\[250\]/);
    expect(source).not.toMatch(/inset-0/);
    expect(source).not.toMatch(/backdrop/i);
  });

  it("Accept and Reject buttons share one BUTTON_CLASS constant — identical className, only the label differs", () => {
    const source = readSource();
    expect(source).toMatch(/const BUTTON_CLASS\s*=/);
    const rejectButton = source.match(/onClick=\{onReject\}[\s\S]{0,80}/);
    const acceptButton = source.match(/onClick=\{onAccept\}[\s\S]{0,80}/);
    expect(rejectButton).not.toBeNull();
    expect(acceptButton).not.toBeNull();
    expect(rejectButton![0]).toMatch(/className=\{BUTTON_CLASS\}/);
    expect(acceptButton![0]).toMatch(/className=\{BUTTON_CLASS\}/);
  });

  it("has no pre-ticked/checked inputs anywhere (no defaultChecked or checked attributes)", () => {
    const source = readSource();
    expect(source).not.toMatch(/defaultChecked/);
    expect(source).not.toMatch(/\bchecked=/);
  });

  it("exposes onAccept/onReject/policyHref/labels props", () => {
    const source = readSource();
    expect(source).toMatch(/onAccept/);
    expect(source).toMatch(/onReject/);
    expect(source).toMatch(/policyHref/);
    expect(source).toMatch(/labels/);
  });
});

describe("CookieConsent (design.md: container — banner | reopener | null)", () => {
  it("exists", () => {
    expect(fs.existsSync(CONSENT_PATH)).toBe(true);
  });

  const readSource = () => fs.readFileSync(CONSENT_PATH, "utf-8");

  it("imports useConsent from ConsentContext and CookieBanner", () => {
    const source = readSource();
    expect(source).toMatch(/useConsent/);
    expect(source).toMatch(/CookieBanner/);
  });

  it('returns null when status === "unknown" (SSR-safe, no hydration mismatch)', () => {
    const source = readSource();
    expect(source).toMatch(/status === "unknown"/);
  });

  it('renders <CookieBanner /> only when status === "pending"', () => {
    const source = readSource();
    expect(source).toMatch(/status === "pending"/);
    expect(source).toMatch(/<CookieBanner/);
  });

  it("reads window.__scAnalyticsScope to hide on /admin, /panel, /login", () => {
    const source = readSource();
    expect(source).toMatch(/__scAnalyticsScope/);
  });

  it("renders no backdrop / no inset-0 overlay anywhere in the container (no cookie-wall)", () => {
    const source = readSource();
    expect(source).not.toMatch(/inset-0/);
    expect(source).not.toMatch(/backdrop/i);
  });

  it("reopener control is fixed bottom-4 left-4 (bottom-left) — chatbot owns bottom-right z-[100]", () => {
    const source = readSource();
    expect(source).toMatch(/bottom-4 left-4/);
    expect(source).not.toMatch(/bottom-4 right-4/);
  });

  it("reopener has no pre-ticked/checked inputs (it's a plain button, not a toggle)", () => {
    const source = readSource();
    expect(source).not.toMatch(/defaultChecked/);
    expect(source).not.toMatch(/\bchecked=/);
  });
});
