import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@shared/context/LanguageContext";
import type { Translation } from "@shared/context/LanguageContext";
import { SOLUTIONS } from "@shared/config/solutions";

interface RelatedServicesProps {
  /** SOLUTIONS id of the current page — excluded from the list. */
  currentId: string;
}

/**
 * Cross-links the other product/service pages from each product page
 * (internal-linking map, docs/SEO_PROTOCOL.md §3).
 */
export const RelatedServices: React.FC<RelatedServicesProps> = ({
  currentId,
}) => {
  const { t } = useLanguage();
  const others = SOLUTIONS.filter((s) => s.id !== currentId);

  return (
    <section aria-labelledby="related-title" className="py-16 md:py-20">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        <h2
          id="related-title"
          className="text-2xl md:text-3xl font-bold font-display mb-8"
        >
          {t.relatedTitle}
        </h2>
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 list-none">
          {others.map((solution) => (
            <li key={solution.id}>
              <Link
                to={solution.href}
                className="group flex flex-col h-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 hover:border-[var(--color-primary)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
              >
                <span className="font-bold mb-1">
                  {t[solution.titleKey as keyof Translation] as string}
                </span>
                <span className="text-sm text-muted mb-3">
                  {t[solution.descKey as keyof Translation] as string}
                </span>
                <ArrowRight
                  className="mt-auto w-4 h-4 text-[var(--color-primary)] group-hover:translate-x-1 transition-transform"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default RelatedServices;
