import { SolutionConfig } from "../config/solutions";
import {
  Code2,
  Settings2,
  Smartphone,
  Utensils,
  MessageSquare,
  MapPin,
  Cloud,
} from "lucide-react";
import { Translation } from "../context/LanguageContext";
import React from "react";

// Icon color mapping
// const iconColorMap: Record<string, string> = {
//   "software-ia": "text-[var(--color-icon-blue)]",
//   "automatizacion-n8n": "text-[var(--color-icon-purple)]",
//   "tarjetas-nfc": "text-[var(--color-icon-emerald)",
//   "qribar": "text-[var(--color-icon-amber)",
//   "carta-digital": "text-[var(--color-icon-blue)]", // Added missing entry
// };

// Icon component mapping
const iconComponentMap: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  Code2,
  Settings2,
  Smartphone,
  Utensils,
  MessageSquare,
  MapPin,
  Cloud,
};

// SolutionItem type
export interface SolutionItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  href: string;
  internal?: boolean;
  external?: boolean;
}

// Helper function to map SolutionConfig to SolutionItem
export function mapSolutions(
  solutions: SolutionConfig[],
  translations: Translation,
  options: { filterOut?: string[]; hrefPrefix?: string } = {},
): SolutionItem[] {
  return solutions
    .filter((solution) => !options.filterOut?.includes(solution.id))
    .map((solution) => {
      const IconComponent = iconComponentMap[solution.icon];

      // Build href - avoid double slashes when combining prefix + href
      let href: string;
      if (options.hrefPrefix) {
        const prefix = options.hrefPrefix.endsWith("/")
          ? options.hrefPrefix.slice(0, -1)
          : options.hrefPrefix;
        const path = solution.href.startsWith("/")
          ? solution.href
          : "/" + solution.href;
        href = prefix + path;
      } else {
        href = solution.href;
      }

      return {
        id: solution.id,
        icon: React.createElement(IconComponent, {
          className: solution.iconColor,
        }),
        title: translations[solution.titleKey as keyof Translation],
        desc: translations[solution.descKey as keyof Translation],
        href,
        internal: solution.internal,
        external: solution.external,
      };
    });
}
