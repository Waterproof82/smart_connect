import React from "react";
import { WhatsAppCta } from "./WhatsAppCta";

interface ClosingCtaProps {
  title: React.ReactNode;
  intro?: React.ReactNode;
  label?: string;
  message?: string;
  servicio?: string;
  id?: string;
}

/**
 * The closing block every product page ends on: one sentence, one action.
 */
export const ClosingCta: React.FC<ClosingCtaProps> = ({
  title,
  intro,
  label,
  message,
  servicio,
  id,
}) => {
  const headingId = `${id ?? "closing"}-title`;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="ds-section ds-section--alt"
    >
      <div className="ds-container ds-container--prose text-center grid justify-items-center gap-[var(--space-md)]">
        <h2 id={headingId} className="ds-h2">
          {title}
        </h2>
        {intro && <p className="ds-lede">{intro}</p>}
        <WhatsAppCta label={label} message={message} servicio={servicio} />
      </div>
    </section>
  );
};

export default ClosingCta;
