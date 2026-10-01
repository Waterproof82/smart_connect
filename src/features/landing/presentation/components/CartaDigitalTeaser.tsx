import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@shared/context/LanguageContext";

interface CartaDigitalTeaserProps {
  id: string;
}

/**
 * Home-page teaser for the Carta Digital module. The full content lives on
 * the standalone /carta-digital route (single indexable page for the topic).
 */
const CartaDigitalTeaser: React.FC<CartaDigitalTeaserProps> = ({ id }) => {
  const { t } = useLanguage();
  return (
    <section
      id={id}
      aria-label={t.cartaTeaserEyebrow}
      className="ds-section bg-[var(--color-bg)] text-default"
    >
      <div className="ds-container max-w-3xl text-center">
        <div className="ds-kicker mb-3 md:mb-4">
          {t.cartaTeaserEyebrow}
        </div>
        <h2 className="ds-h2 mb-4 md:mb-6">
          {t.cartaTeaserTitle}
        </h2>
        <p className="text-base md:text-lg text-muted leading-relaxed mb-8">
          {t.cartaTeaserDesc}
        </p>
        <Link
          to="/carta-digital"
          className="inline-flex items-center justify-center min-h-[48px] px-8 py-3 rounded-xl font-bold bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[var(--color-on-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] transition-colors"
        >
          {t.cartaTeaserCta}
        </Link>
      </div>
    </section>
  );
};

export default CartaDigitalTeaser;
