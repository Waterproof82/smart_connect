import React from "react";
import { useLanguage } from "@shared/context/LanguageContext";
import {
  TrendingDown,
  Globe,
  FileText,
  Phone,
  UserX,
  Search,
} from "lucide-react";

const CartaDigitalProblemaSection: React.FC = () => {
  const { t } = useLanguage();

  const problemas = [
    {
      icon: <TrendingDown size={40} />,
      color: "error",
      title: t.cartaProblemaItem1Title,
      desc: t.cartaProblemaItem1Desc,
    },
    {
      icon: <FileText size={40} />,
      color: "error",
      title: t.cartaProblemaItem2Title,
      desc: t.cartaProblemaItem2Desc,
    },
    {
      icon: <Globe size={40} />,
      color: "error",
      title: t.cartaProblemaItem3Title,
      desc: t.cartaProblemaItem3Desc,
    },
    {
      icon: <Phone size={40} />,
      color: "error",
      title: t.cartaProblemaItem4Title,
      desc: t.cartaProblemaItem4Desc,
    },
    {
      icon: <UserX size={40} />,
      color: "error",
      title: t.cartaProblemaItem5Title,
      desc: t.cartaProblemaItem5Desc,
    },
    {
      icon: <Search size={40} />,
      color: "error",
      title: t.cartaProblemaItem6Title,
      desc: t.cartaProblemaItem6Desc,
    },
  ];

  return (
    <section id="problema" className="py-16 md:py-24 bg-[var(--color-bg-alt)]">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-xs font-semibold tracking-[0.3em] text-[var(--color-primary)] uppercase mb-3 md:mb-4">
            {t.cartaProblemaTitle}
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-[1.15] mb-4 md:mb-6 font-display">
            {t.cartaProblemaSubtitle}
          </h2>
          <p className="text-base text-muted leading-relaxed max-w-lg md:max-w-xl mb-10 md:mb-14">
            {t.cartaProblemaDesc}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {problemas.map((item) => (
              <div
                key={item.title}
                className={`bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-5 md:p-6 hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-pointer relative overflow-hidden group ${item.color === "error" ? "hover:border-[var(--color-error-border)]" : ""}`}
              >
                <div className="text-[var(--color-error-text)] mb-4">
                  {item.icon}
                </div>
                <div className="font-bold text-base md:text-lg mb-2">
                  {item.title}
                </div>
                <div className="text-sm text-muted leading-relaxed">
                  {item.desc}
                </div>
                <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--color-error-text)] opacity-40"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CartaDigitalProblemaSection;
