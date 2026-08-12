import fs from "node:fs";
import path from "node:path";

/**
 * HomeFaqSection.test.tsx (co-located with the component) is NOT picked up
 * by this repo's jest testMatch (".test.ts"/".spec.ts" only, no jsdom
 * environment for RTL renders) — a pre-existing gap flagged during PR1/PR2.
 * This structure test is the one that actually runs in CI and is the real
 * RED/GREEN gate for PR3 task 3.7 (NFC FAQ group removed from home).
 */
const SRC = path.resolve(__dirname, "../../../../src");
const HOOK_PATH = path.join(
  SRC,
  "features/landing/presentation/components/HomeFaqSection.tsx",
);

describe("HomeFaqSection — useHomeFaqGroups() / useNfcFaqGroup() split (PR3)", () => {
  const source = fs.readFileSync(HOOK_PATH, "utf-8");

  it("useHomeFaqGroups() no longer includes the Tarjetas NFC FAQ group", () => {
    const fnMatch = source.match(
      /export function useHomeFaqGroups\(\)[\s\S]*?\n}\n/,
    );
    expect(fnMatch).not.toBeNull();
    expect(fnMatch![0]).not.toMatch(/tapReviewFAQTitle/);
    expect(fnMatch![0]).not.toMatch(/tapReviewFAQ1Question/);
  });

  it("exports a new useNfcFaqGroup() hook for the standalone /tarjetas-nfc page", () => {
    expect(source).toMatch(/export function useNfcFaqGroup\(/);
  });

  it("useNfcFaqGroup() sources the tapReviewFAQ* translation keys", () => {
    const fnMatch = source.match(
      /export function useNfcFaqGroup\([\s\S]*?\n}\n?/,
    );
    expect(fnMatch).not.toBeNull();
    expect(fnMatch![0]).toMatch(/tapReviewFAQTitle/);
    expect(fnMatch![0]).toMatch(/tapReviewFAQ1Question/);
    expect(fnMatch![0]).toMatch(/tapReviewFAQ2Question/);
    expect(fnMatch![0]).toMatch(/tapReviewFAQ3Question/);
  });
});
