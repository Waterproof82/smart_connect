export interface SolutionJsonLd {
  description: string;
  serviceType: string;
  areaServed: string[];
  /** External profile URLs this solution is also known by (e.g. QRIBAR's own domain). */
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
    href: "/carta-digital",
    internal: true,
    iconColor: "text-[var(--color-icon-emerald)]",
    serviceValue: "Carta Digital Premium",
    jsonLd: {
      description:
        "Menú digital con pedidos en tiempo real desde la mesa a barra y cocina. Sin comisiones por pedido.",
      serviceType: "Digital Menu Platform",
      areaServed: ["Tenerife", "Gran Canaria", "Lanzarote", "Canarias"],
      sameAs: ["https://qribar.es"],
    },
  },
  {
    id: "tarjetas-nfc",
    icon: "Smartphone",
    titleKey: "navbarNFC",
    descKey: "navbarNFCDesc",
    href: "/tap-review",
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
  {
    id: "qribar",
    icon: "Utensils",
    titleKey: "navbarQribar",
    descKey: "navbarQribarDesc",
    href: "https://qribar.es",
    external: true,
    iconColor: "text-[var(--color-icon-amber)]",
    serviceValue: "QRIBAR - Menú Digital",
    jsonLd: {
      description:
        "Menú digital con pedidos en tiempo real desde la mesa a barra y cocina. Sin comisiones por pedido.",
      serviceType: "Digital Menu Platform",
      areaServed: ["Tenerife", "Gran Canaria", "Lanzarote", "Canarias"],
    },
  },
  {
    id: "automation-n8n",
    icon: "Settings2",
    titleKey: "navbarAutomationN8n",
    descKey: "navbarAutomationN8nDesc",
    href: "/automatizacion-restaurantes-n8n",
    internal: true,
    iconColor: "text-[var(--color-icon-purple)]",
    serviceValue: "Automatización n8n",
    jsonLd: {
      description:
        "Flujos de trabajo automatizados que conectan CRM, email, WhatsApp y redes sociales para captación y fidelización.",
      serviceType: "Workflow Automation",
      areaServed: ["Tenerife", "Canarias"],
    },
  },
  {
    id: "whatsapp-automation",
    icon: "MessageSquare",
    titleKey: "navbarWhatsAppAutomation",
    descKey: "navbarWhatsAppAutomationDesc",
    href: "/automatizacion-whatsapp-restaurante",
    internal: true,
    iconColor: "text-[var(--color-icon-blue)]",
    serviceValue: "Automatización WhatsApp",
    jsonLd: {
      description:
        "Respuestas automáticas 24/7 para reservas, consultas y pedidos vía WhatsApp Business.",
      serviceType: "WhatsApp Automation",
      areaServed: ["Tenerife", "Canarias"],
    },
  },
  {
    id: "software-canarias",
    icon: "MapPin",
    titleKey: "navbarSoftwareCanarias",
    descKey: "navbarSoftwareCanariasDesc",
    href: "/software-restaurantes-canarias",
    internal: true,
    iconColor: "text-[var(--color-icon-blue)]",
    serviceValue: "Software Canarias",
    jsonLd: {
      description:
        "Soluciones de software a medida para hostelería y comercios locales en Canarias.",
      serviceType: "Custom Software",
      areaServed: ["Tenerife", "Canarias"],
    },
  },
  {
    id: "digitalization-tenerife",
    icon: "Cloud",
    titleKey: "navbarDigitalizationTenerife",
    descKey: "navbarDigitalizationTenerifeDesc",
    href: "/digitalizacion-hosteleria-tenerife",
    internal: true,
    iconColor: "text-[var(--color-icon-emerald)]",
    serviceValue: "Digitalización Tenerife",
    jsonLd: {
      description:
        "Transformación digital completa para restaurantes y bares en Tenerife: menús QR, NFC, automatización e IA.",
      serviceType: "Digital Transformation",
      areaServed: ["Tenerife", "Canarias"],
    },
  },
];
