export interface SolutionJsonLd {
  description: string;
  serviceType: string;
  areaServed: string[];
  /** External profile URLs this solution is also known by. */
  sameAs?: string[];
}

export interface SolutionConfig {
  id: string;
  icon: string; // Icon name (e.g., "Code2", "Settings2")
  titleKey: string;
  descKey: string;
  href: string;
  iconColor: string; // Tailwind CSS class for icon color
  internal?: boolean;
  external?: boolean;
  /** Value used by the Contact form's service <select> and Features.tsx CTA links. */
  serviceValue: string;
  /** Structured-data metadata consumed by buildHomeSchema() to emit Service JSON-LD nodes. */
  jsonLd: SolutionJsonLd;
}

export const SOLUTIONS: SolutionConfig[] = [
  {
    id: "carta-digital",
    icon: "Utensils",
    titleKey: "navbarCartaDigital",
    descKey: "navbarCartaDigitalDesc",
    href: "#carta-digital",
    internal: true,
    iconColor: "text-[var(--color-icon-emerald)]",
    serviceValue: "Carta Digital Premium",
    jsonLd: {
      description:
        "Menú digital con pedidos en tiempo real desde la mesa a barra y cocina. Sin comisiones por pedido.",
      serviceType: "Digital Menu Platform",
      areaServed: ["Tenerife", "Gran Canaria", "Lanzarote", "Canarias"],
    },
  },
  {
    id: "tarjetas-nfc",
    icon: "Smartphone",
    titleKey: "navbarNFC",
    descKey: "navbarNFCDesc",
    href: "/tarjetas-nfc",
    internal: true,
    iconColor: "text-[var(--color-icon-emerald)]",
    serviceValue: "Tarjetas NFC Reseñas",
    jsonLd: {
      description:
        "Tarjetas NFC para que los clientes dejen reseñas en Google e Instagram con un solo toque.",
      serviceType: "NFC Review Solution",
      areaServed: ["Tenerife", "Canarias", "España"],
    },
  },
];
