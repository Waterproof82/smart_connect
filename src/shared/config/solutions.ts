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
    id: "software-ia",
    icon: "Code2",
    titleKey: "navbarSoftwareIA",
    descKey: "navbarSoftwareIADesc",
    href: "#soluciones",
    iconColor: "text-[var(--color-icon-blue)]",
  },
  {
    id: "automatizacion-n8n",
    icon: "Settings2",
    titleKey: "navbarAutomation",
    descKey: "navbarAutomationDesc",
    href: "#soluciones",
    iconColor: "text-[var(--color-icon-purple)]",
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
    id: "carta-digital",
    icon: "Utensils",
    titleKey: "navbarCartaDigital",
    descKey: "navbarCartaDigitalDesc",
    href: "/carta-digital",
    internal: true,
    iconColor: "text-[var(--color-icon-emerald)]",
  },
  {
    id: "nfc-tap-to-review",
    icon: "Smartphone",
    titleKey: "navbarNFCReview",
    descKey: "navbarNFCReviewDesc",
    href: "/nfc-tap-to-review",
    internal: true,
    iconColor: "text-[var(--color-icon-emerald)]",
  },
  {
    id: "automation-n8n",
    icon: "Settings2",
    titleKey: "navbarAutomationN8n",
    descKey: "navbarAutomationN8nDesc",
    href: "/automation-n8n",
    internal: true,
    iconColor: "text-[var(--color-icon-purple)]",
  },
  {
    id: "whatsapp-automation",
    icon: "MessageSquare",
    titleKey: "navbarWhatsAppAutomation",
    descKey: "navbarWhatsAppAutomationDesc",
    href: "/whatsapp-automation",
    internal: true,
    iconColor: "text-[var(--color-icon-blue)]",
  },
  {
    id: "software-canarias",
    icon: "MapPin",
    titleKey: "navbarSoftwareCanarias",
    descKey: "navbarSoftwareCanariasDesc",
    href: "/software-canarias",
    internal: true,
    iconColor: "text-[var(--color-icon-blue)]",
  },
  {
    id: "digitalization-tenerife",
    icon: "Cloud",
    titleKey: "navbarDigitalizationTenerife",
    descKey: "navbarDigitalizationTenerifeDesc",
    href: "/digitalization-tenerife",
    internal: true,
    iconColor: "text-[var(--color-icon-emerald)]",
  },
  {
    id: "menu-digital-sin-app",
    icon: "Utensils",
    titleKey: "navbarMenuDigitalSinApp",
    descKey: "navbarMenuDigitalSinAppDesc",
    href: "/menu-digital-sin-app",
    internal: true,
    iconColor: "text-[var(--color-icon-amber)]",
  },
];
