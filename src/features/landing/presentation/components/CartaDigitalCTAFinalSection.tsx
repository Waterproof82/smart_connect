import React from "react";
import { useLanguage } from "@shared/context/LanguageContext";
import { MessageSquare } from "lucide-react";

interface CartaDigitalCTAFinalSectionProps {
  whatsappPhone: string;
}

const CartaDigitalCTAFinalSection: React.FC<
  CartaDigitalCTAFinalSectionProps
> = ({ whatsappPhone }) => {
  const { t } = useLanguage();

  const waLink = whatsappPhone
    ? `https://wa.me/${whatsappPhone}`
    : "#contacto?servicio=Carta%20Digital%20Premium";

  return (
    <section
      id="cta-final"
      className="py-16 md:py-24"
      style={{
        background:
          "radial-gradient(ellipse at 50% 50%, rgba(201,168,76,0.12) 0%, transparent 70%), var(--color-bg)",
      }}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-xs font-semibold tracking-[0.25em] text-[var(--color-primary)] uppercase mb-4">
            {t.cartaCTATitle}
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-[1.1] mb-6 font-display">
            {t.cartaCTASubtitle}
          </h2>
          <p className="text-base md:text-lg text-muted max-w-md mx-auto mb-8 md:mb-12 leading-relaxed">
            {t.featuresCartaDigitalDesc}
          </p>

          <div className="flex flex-wrap gap-3 md:gap-4 justify-center mb-12 md:mb-16">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 md:px-10 py-3 md:py-4 rounded-xl bg-[var(--color-primary)] text-[var(--color-bg)] font-bold text-sm tracking-wider uppercase hover:opacity-90 transition-all cursor-pointer border-none min-h-[48px] inline-flex items-center justify-center gap-2 no-underline"
            >
              <MessageSquare size={18} />
              {t.cartaCTABtnDemo}
            </a>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 md:px-10 py-3 md:py-4 rounded-xl bg-transparent text-default font-medium text-sm cursor-pointer border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all min-h-[48px] flex items-center gap-2 no-underline"
            >
              <MessageSquare size={18} />
              {t.cartaCTABtnContact}
            </a>
          </div>

          <div className="w-px h-10 bg-[var(--color-primary)] mx-auto mb-6"></div>

          <div className="flex flex-wrap gap-4 md:gap-8 justify-center text-sm text-muted">
            <span className="flex items-center gap-2">
              {t.cartaCTANoContract}
            </span>
            <span className="flex items-center gap-2">
              {t.cartaCTASignup48h}
            </span>
            <span className="flex items-center gap-2">{t.cartaCTASupport}</span>
            <span className="flex items-center gap-2">{t.cartaCTANoComm}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CartaDigitalCTAFinalSection;
