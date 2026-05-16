export interface SolutionConfig {
  id: string;
  icon: string; // Icon name (e.g., "Code2", "Settings2")
  titleKey: string;
  descKey: string;
  href: string;
  iconColor: string; // Tailwind CSS class for icon color
  internal?: boolean;
  external?: boolean;
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
  },
  {
    id: "tarjetas-nfc",
    icon: "Smartphone",
    titleKey: "navbarNFC",
    descKey: "navbarNFCDesc",
    href: "/tap-review",
    internal: true,
    iconColor: "text-[var(--color-icon-emerald)]",
  },
  {
    id: "qribar",
    icon: "Utensils",
    titleKey: "navbarQribar",
    descKey: "navbarQribarDesc",
    href: "https://qribar.es",
    external: true,
    iconColor: "text-[var(--color-icon-amber)]",
  },
  {
    id: "automation-n8n",
    icon: "Settings2",
    titleKey: "navbarAutomationN8n",
    descKey: "navbarAutomationN8nDesc",
    href: "/automatizacion-restaurantes-n8n",
    internal: true,
    iconColor: "text-[var(--color-icon-purple)]",
  },
  {
    id: "whatsapp-automation",
    icon: "MessageSquare",
    titleKey: "navbarWhatsAppAutomation",
    descKey: "navbarWhatsAppAutomationDesc",
    href: "/automatizacion-whatsapp-restaurante",
    internal: true,
    iconColor: "text-[var(--color-icon-blue)]",
  },
  {
    id: "software-canarias",
    icon: "MapPin",
    titleKey: "navbarSoftwareCanarias",
    descKey: "navbarSoftwareCanariasDesc",
    href: "/software-restaurantes-canarias",
    internal: true,
    iconColor: "text-[var(--color-icon-blue)]",
  },
  {
    id: "digitalization-tenerife",
    icon: "Cloud",
    titleKey: "navbarDigitalizationTenerife",
    descKey: "navbarDigitalizationTenerifeDesc",
    href: "/digitalizacion-hosteleria-tenerife",
    internal: true,
    iconColor: "text-[var(--color-icon-emerald)]",
  },
];

// Map route paths to solution IDs for navbar filtering
export const ROUTE_TO_SOLUTION_ID: Record<string, string> = {
  "/carta-digital": "carta-digital",
  "/tap-review": "tarjetas-nfc",
  "/automatizacion-restaurantes-n8n": "automation-n8n",
  "/automatizacion-whatsapp-restaurante": "whatsapp-automation",
  "/software-restaurantes-canarias": "software-canarias",
  "/digitalizacion-hosteleria-tenerife": "digitalization-tenerife",
};
