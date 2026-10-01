import {
  classifyContactHref,
  trackEvent,
  registerContactClickTracking,
} from "@shared/utils/analyticsEvents";

type GtagWindow = typeof globalThis & {
  gtag?: (...args: unknown[]) => void;
  __scAnalyticsScope?: boolean;
};
const win = globalThis as GtagWindow;

describe("classifyContactHref", () => {
  it.each([
    ["https://wa.me/34601396419", "contact_whatsapp"],
    ["https://api.whatsapp.com/send?phone=34601396419", "contact_whatsapp"],
    ["tel:+34601396419", "contact_phone"],
    ["mailto:info@digitalizatenerife.es", "contact_email"],
  ])("%s → %s", (href, expected) => {
    expect(classifyContactHref(href)).toBe(expected);
  });

  it.each(["/carta-digital", "https://digitalizatenerife.es/", "#contacto", ""])(
    "ignores non-contact link %p",
    (href) => {
      expect(classifyContactHref(href)).toBeNull();
    },
  );
});

describe("trackEvent", () => {
  afterEach(() => {
    delete win.gtag;
    delete win.__scAnalyticsScope;
  });

  it("sends a GA4 event when gtag exists and the route is in analytics scope", () => {
    const gtag = jest.fn();
    win.gtag = gtag;
    win.__scAnalyticsScope = true;
    trackEvent("generate_lead", { form_id: "contact" });
    expect(gtag).toHaveBeenCalledWith("event", "generate_lead", { form_id: "contact" });
  });

  it("does nothing outside analytics scope (admin routes)", () => {
    const gtag = jest.fn();
    win.gtag = gtag;
    win.__scAnalyticsScope = false;
    trackEvent("generate_lead");
    expect(gtag).not.toHaveBeenCalled();
  });

  it("does nothing when gtag is not loaded", () => {
    win.__scAnalyticsScope = true;
    expect(() => trackEvent("generate_lead")).not.toThrow();
  });
});

describe("registerContactClickTracking", () => {
  afterEach(() => {
    delete win.gtag;
    delete win.__scAnalyticsScope;
  });

  function fakeDocument() {
    let handler: ((e: { target: unknown }) => void) | undefined;
    return {
      doc: {
        addEventListener: jest.fn((_type: string, h: (e: { target: unknown }) => void) => {
          handler = h;
        }),
        removeEventListener: jest.fn(),
      },
      click: (target: unknown) => handler?.({ target }),
    };
  }
  const anchor = (href: string) => ({
    closest: (selector: string) =>
      selector === "a[href]" ? { getAttribute: () => href } : null,
  });

  it("tracks clicks on WhatsApp links with the page path and no phone number", () => {
    const gtag = jest.fn();
    win.gtag = gtag;
    win.__scAnalyticsScope = true;
    const { doc, click } = fakeDocument();
    registerContactClickTracking(doc as unknown as Document, () => "/carta-digital");
    click(anchor("https://wa.me/34601396419"));
    expect(gtag).toHaveBeenCalledWith("event", "contact_whatsapp", {
      page_path: "/carta-digital",
    });
  });

  it("ignores clicks on regular links and non-element targets", () => {
    const gtag = jest.fn();
    win.gtag = gtag;
    win.__scAnalyticsScope = true;
    const { doc, click } = fakeDocument();
    registerContactClickTracking(doc as unknown as Document, () => "/");
    click(anchor("/tpv-restaurantes"));
    click(null);
    click({});
    expect(gtag).not.toHaveBeenCalled();
  });

  it("returns a cleanup that removes the listener", () => {
    const { doc } = fakeDocument();
    const cleanup = registerContactClickTracking(doc as unknown as Document, () => "/");
    cleanup();
    expect(doc.removeEventListener).toHaveBeenCalled();
  });
});
