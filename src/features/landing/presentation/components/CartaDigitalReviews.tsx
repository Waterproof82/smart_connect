import React from "react";
import { Star } from "lucide-react";
import { useLanguage } from "@shared/context/LanguageContext";
import { CARTA_DIGITAL_REVIEWS } from "@features/landing/data/cartaDigitalReviews";

interface CartaDigitalReviewsProps {
  /** Lets the owning section link its outer `aria-labelledby` to this h2. */
  headingId?: string;
}

/**
 * Carta Digital social proof: 2 real, attributed QR iBar reviews (Carlos S.,
 * Luis M.; 5★; 2022) — replaces the unsourced Success Stats block.
 * Static markup only (no IntersectionObserver, no hidden-then-revealed
 * scroll animation), so it can never cause an SSR/CSR mismatch. No Review
 * JSON-LD (structured-data-policy: self-serving Review markup is spam).
 */
export const CartaDigitalReviews: React.FC<CartaDigitalReviewsProps> = ({
  headingId,
}) => {
  const { t } = useLanguage();

  return (
    <div className="ds-container">
      <div className="max-w-2xl mb-14">
        <p className="text-sm font-semibold text-[var(--color-primary)] mb-3">
          {t.cartaReviewsEyebrow}
        </p>
        <h2 id={headingId} className="ds-h2">
          {t.cartaReviewsTitle}
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {CARTA_DIGITAL_REVIEWS.map((review) => (
          <figure
            key={review.author}
            className="bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-xl p-7 flex flex-col"
          >
            <div
              className="flex gap-0.5 mb-4"
              role="img"
              aria-label={`${review.rating} ${t.cartaReviewsRatingOf}`}
            >
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  aria-hidden="true"
                  className="w-3.5 h-3.5 fill-[var(--color-icon-amber)] text-[var(--color-icon-amber)]"
                />
              ))}
            </div>
            <blockquote
              lang="es"
              className="leading-relaxed text-default flex-1 mb-6 text-base"
            >
              {review.quote}
            </blockquote>
            <figcaption>
              <div className="font-bold text-default text-sm">
                {review.author}
              </div>
              <div className="text-xs text-muted mt-0.5">
                {t.cartaReviewsSource} · {review.year}
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
};

export default CartaDigitalReviews;
