import { buildWhatsappLink } from "@shared/utils/whatsappLink";

describe("buildWhatsappLink", () => {
  it("falls back to the absolute contact form when there is no phone", () => {
    expect(buildWhatsappLink("")).toEqual({ href: "/#contacto", external: false });
  });

  it("carries the service into the fallback query string", () => {
    expect(buildWhatsappLink("", { servicio: "TPV para restaurantes" })).toEqual({
      href: "/#contacto?servicio=TPV%20para%20restaurantes",
      external: false,
    });
  });

  it("builds a wa.me link with a URL-encoded pre-filled message", () => {
    expect(
      buildWhatsappLink("34600000000", { message: "Hola, me interesa el TPV." }),
    ).toEqual({
      href: "https://wa.me/34600000000?text=Hola%2C%20me%20interesa%20el%20TPV.",
      external: true,
    });
  });

  it("sanitises the phone to digits only — wa.me rejects '+', spaces and dashes", () => {
    expect(buildWhatsappLink("+34 600-000-000").href).toBe("https://wa.me/34600000000");
  });

  it("omits ?text= when no message is given", () => {
    expect(buildWhatsappLink("34600000000").href).toBe("https://wa.me/34600000000");
  });
});
