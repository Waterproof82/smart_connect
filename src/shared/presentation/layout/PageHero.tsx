import React from "react";

interface PageHeroProps {
  /** Heading content. Rendered as `as` (default h1 — one per page). */
  title: React.ReactNode;
  as?: "h1" | "h2";
  lede?: React.ReactNode;
  /** CTA row — normally a <WhatsAppCta/> plus an optional ghost link. */
  actions?: React.ReactNode;
  /** Small supporting line under the actions (audience, reassurance). */
  note?: React.ReactNode;
  size?: "lg" | "md";
  id?: string;
}

/**
 * Shared page opener (design.md § Page hero): title left, lede + CTA right,
 * stacked on mobile. Owns the single fixed-nav offset so pages never add
 * their own top padding.
 */
export const PageHero: React.FC<PageHeroProps> = ({
  title,
  as: Heading = "h1",
  lede,
  actions,
  note,
  size = "md",
  id,
}) => (
  <header id={id} className="ds-hero">
    <div className="ds-container ds-hero__grid">
      <Heading className={`ds-h1 ${size === "md" ? "ds-h1--s" : ""}`}>
        {title}
      </Heading>
      {(lede || actions || note) && (
        <div className="ds-hero__aside">
          {lede && <p className="ds-lede">{lede}</p>}
          {actions && <div className="ds-actions">{actions}</div>}
          {note && <p className="text-sm text-muted m-0">{note}</p>}
        </div>
      )}
    </div>
  </header>
);

export default PageHero;
