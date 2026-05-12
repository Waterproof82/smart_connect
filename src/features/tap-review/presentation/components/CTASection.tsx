import React from "react";
import { useLanguage } from "@shared/context/LanguageContext";
import { Smartphone } from "lucide-react";

interface CTASectionProps {
  whatsappPhone?: string;
}

const CTASection: React.FC<CTASectionProps> = ({ whatsappPhone = "" }) => {
  const { t } = useLanguage();
  const handleClick = () => {
    if (whatsappPhone) {
      globalThis.open(`https://wa.me/${whatsappPhone}`, "_blank");
    } else {
      globalThis.location.hash = "contacto?servicio=Tap%20Review%20NFC";
    }
  };

  return (
    <div className="bg-[var(--color-accent)] text-[var(--color-on-accent)] p-8 rounded-lg text-center">
      <h2 className="text-3xl font-bold mb-4">{t.ctaTitle}</h2>
      <p className="text-xl mb-6">{t.ctaSubtitle}</p>
      <button
        onClick={handleClick}
        className="bg-[var(--color-surface)] text-[var(--color-accent)] font-bold py-3 px-6 rounded-lg hover:bg-[var(--color-bg-alt)] transition duration-300"
      >
        {t.ctaButton}
      </button>
    </div>
  );
};

export default CTASection;
