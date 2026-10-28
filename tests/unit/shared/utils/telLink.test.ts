import { buildTelHref } from "@shared/utils/telLink";
import { classifyContactHref } from "@shared/utils/analyticsEvents";

describe("buildTelHref", () => {
  it.each([
    ["+34 600 00 00 00", "tel:+34600000000"],
    ["34600000000", "tel:+34600000000"],
    ["+34-600-000-000", "tel:+34600000000"],
  ])("%s → %s", (raw, expected) => {
    expect(buildTelHref(raw)).toBe(expected);
  });

  it("returns undefined when there is no phone", () => {
    expect(buildTelHref("")).toBeUndefined();
    expect(buildTelHref("abc")).toBeUndefined();
  });

  it("is classified as contact_phone by the click tracker", () => {
    expect(classifyContactHref(buildTelHref("+34600000000") ?? "")).toBe(
      "contact_phone",
    );
  });
});
