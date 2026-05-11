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
];
