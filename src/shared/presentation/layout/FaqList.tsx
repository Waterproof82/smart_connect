import React from "react";
import { Plus } from "lucide-react";

export interface FaqItem {
  q: string;
  a: string;
}

/**
 * Native <details> FAQ list. Answers stay in the DOM (SSR) so the visible
 * text always matches the page's FAQPage JSON-LD.
 */
export const FaqList: React.FC<{ items: FaqItem[] }> = ({ items }) => (
  <div className="border-t border-[var(--color-border)]">
    {items.map((faq) => (
      <details
        key={faq.q}
        className="group border-b border-[var(--color-border)]"
      >
        <summary className="flex items-start justify-between gap-4 py-5 cursor-pointer list-none font-semibold text-base md:text-lg select-none [&::-webkit-details-marker]:hidden focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-2 rounded-sm">
          <span className="min-w-0">{faq.q}</span>
          <Plus
            className="w-5 h-5 mt-0.5 shrink-0 text-[var(--color-primary)] transition-transform duration-150 group-open:rotate-45"
            aria-hidden="true"
          />
        </summary>
        <p className="pb-5 pr-9 text-muted leading-relaxed m-0 max-w-[65ch]">
          {faq.a}
        </p>
      </details>
    ))}
  </div>
);

export default FaqList;
