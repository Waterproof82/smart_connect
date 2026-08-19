import React from "react";
import { MapPin } from "lucide-react";
import { useLanguage } from "@shared/context/LanguageContext";
import { DotField } from "@shared/presentation/components/DotField";

interface CartaDigitalHeroSectionProps {
  onScrollToSection: (id: string) => void;
}

const CartaDigitalHeroSection: React.FC<CartaDigitalHeroSectionProps> = ({
  onScrollToSection,
}) => {
  const { t } = useLanguage();

  return (
    <section
      id="hero"
      className="min-h-screen flex flex-col items-center justify-center px-4 md:px-6 pt-24 pb-16 relative overflow-hidden bg-[var(--color-bg)]"
    >
      <DotField
        className="absolute inset-x-0 bottom-0 h-1/2"
        mask="radial-gradient(ellipse 70% 100% at 50% 100%, black 55%, transparent 80%)"
      />

      <div className="container mx-auto relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-block text-xs font-semibold tracking-[0.25em] text-[var(--color-primary)] uppercase border border-[var(--color-accent-border)] px-4 py-2 rounded-full mb-6 md:mb-8">
            {t.cartaHeroEyebrow}
          </div>
          <div className="flex items-center justify-center gap-1.5 text-sm md:text-base text-muted font-medium mb-4">
            <MapPin className="w-4 h-4 shrink-0" aria-hidden="true" />
            {t.cartaHeroTenerife}
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.1] mb-4 md:mb-6 font-display">
            {t.cartaHeroTitle1}
            <br />
            <span className="text-[var(--color-primary)] italic">
              {t.cartaHeroTitleAccent}
            </span>
            <br />
            {t.cartaHeroTitle2}
          </h2>

          <p className="text-base md:text-lg lg:text-xl text-muted max-w-xl mx-auto mb-8 md:mb-12 leading-relaxed">
            {t.cartaHeroSubtitle}
          </p>

          <div className="flex flex-wrap gap-3 md:gap-4 justify-center mb-10 md:mb-16">
            <button
              type="button"
              onClick={() => onScrollToSection("demo")}
              className="btn-primary text-sm tracking-wider uppercase"
            >
              {t.cartaHeroButtonDemo}
            </button>
            <button
              type="button"
              onClick={() => onScrollToSection("dinero")}
              className="btn-secondary text-sm"
            >
              {t.cartaHeroButtonCalc}
            </button>
          </div>

          <div className="flex flex-wrap gap-6 md:gap-10 lg:gap-12 justify-center">
            {[
              { num: "5", label: t.cartaHeroStat1Label },
              { num: "0%", label: t.cartaHeroStat2Label },
              { num: "24/7", label: t.cartaHeroStat3Label },
              { num: "∞", label: t.cartaHeroStat4Label },
            ].map((stat) => (
              <div key={stat.num} className="text-center">
                <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-[var(--color-primary)] font-display">
                  {stat.num}
                </div>
                <div className="text-xs text-muted uppercase tracking-widest mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className="hidden sm:block [@media(max-height:500px)]:hidden mt-10 md:mt-14"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 960 220"
            data-testid="carta-hero-band"
            className="w-full h-auto max-h-[180px] lg:max-h-[220px]"
            aria-hidden="true"
            focusable="false"
          >
            <rect
              x="0"
              y="186"
              width="960"
              height="34"
              rx="16"
              fill="var(--color-surface)"
              stroke="var(--color-border)"
              strokeWidth="1.5"
            />
            <rect
              x="0"
              y="186"
              width="960"
              height="6"
              rx="3"
              fill="var(--color-accent)"
            />

            {/* Idiomas: globe + stacked language chips */}
            <g className="animate-float-fancy" style={{ animationDelay: "0s" }}>
              <g transform="translate(120,110)">
                <circle
                  cx="0"
                  cy="0"
                  r="34"
                  fill="var(--color-bg)"
                  stroke="var(--color-text)"
                  strokeWidth="3"
                />
                <path
                  d="M-34 0 H34 M0 -34 V34 M-24 -22 Q0 -8 24 -22 M-24 22 Q0 8 24 22"
                  fill="none"
                  stroke="var(--color-text)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <rect
                  x="18"
                  y="-64"
                  width="28"
                  height="16"
                  rx="4"
                  fill="var(--color-surface)"
                  stroke="var(--color-border)"
                  strokeWidth="1.5"
                />
                <rect
                  x="24"
                  y="-48"
                  width="28"
                  height="16"
                  rx="4"
                  fill="var(--color-surface)"
                  stroke="var(--color-border)"
                  strokeWidth="1.5"
                />
                <rect
                  x="20"
                  y="-32"
                  width="28"
                  height="16"
                  rx="4"
                  fill="var(--color-accent)"
                />
              </g>
            </g>

            {/* Comisiones: coin with diagonal strike */}
            <g
              className="animate-float-fancy"
              style={{ animationDelay: "-1.2s" }}
            >
              <g transform="translate(360,110)">
                <circle
                  cx="0"
                  cy="0"
                  r="34"
                  fill="var(--color-surface)"
                  stroke="var(--color-text)"
                  strokeWidth="3"
                />
                <circle
                  cx="0"
                  cy="0"
                  r="20"
                  fill="none"
                  stroke="var(--color-border)"
                  strokeWidth="2"
                />
                <line
                  x1="-30"
                  y1="30"
                  x2="30"
                  y2="-30"
                  stroke="var(--color-icon-amber)"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </g>
            </g>

            {/* Pedidos online: clock overlapped by notification card */}
            <g
              className="animate-float-fancy"
              style={{ animationDelay: "-2.1s" }}
            >
              <g transform="translate(600,110)">
                <circle
                  cx="-10"
                  cy="0"
                  r="30"
                  fill="var(--color-bg)"
                  stroke="var(--color-text)"
                  strokeWidth="3"
                />
                <line
                  x1="-10"
                  y1="0"
                  x2="-10"
                  y2="-18"
                  stroke="var(--color-text)"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
                <line
                  x1="-10"
                  y1="0"
                  x2="4"
                  y2="6"
                  stroke="var(--color-text)"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
                <rect
                  x="10"
                  y="-32"
                  width="46"
                  height="32"
                  rx="8"
                  fill="var(--color-accent)"
                />
                <circle cx="21" cy="-16" r="3" fill="var(--color-on-accent)" />
                <rect
                  x="29"
                  y="-19"
                  width="20"
                  height="5"
                  rx="2.5"
                  fill="var(--color-on-accent)"
                />
                <rect
                  x="29"
                  y="-11"
                  width="14"
                  height="5"
                  rx="2.5"
                  fill="var(--color-on-accent)"
                />
              </g>
            </g>

            {/* Clientes: 3 customer figures, last clipped by right edge */}
            <g className="animate-float-fancy" style={{ animationDelay: "-3s" }}>
              <g transform="translate(800,110)">
                <circle
                  cx="0"
                  cy="-14"
                  r="12"
                  fill="var(--color-bg)"
                  stroke="var(--color-text)"
                  strokeWidth="2.4"
                />
                <path
                  d="M-16 30 a16 16 0 0 1 32 0 Z"
                  fill="var(--color-bg)"
                  stroke="var(--color-text)"
                  strokeWidth="2.4"
                  strokeLinejoin="round"
                />
              </g>
              <g transform="translate(840,114)">
                <circle cx="0" cy="-14" r="14" fill="var(--color-accent)" />
                <path
                  d="M-18 32 a18 18 0 0 1 36 0 Z"
                  fill="var(--color-accent)"
                />
              </g>
              <g transform="translate(930,110)">
                <circle
                  cx="0"
                  cy="-14"
                  r="14"
                  fill="var(--color-bg)"
                  stroke="var(--color-text)"
                  strokeWidth="2.4"
                />
                <path
                  d="M-18 32 a18 18 0 0 1 36 0 Z"
                  fill="var(--color-bg)"
                  stroke="var(--color-text)"
                  strokeWidth="2.4"
                  strokeLinejoin="round"
                />
              </g>
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
};

export default CartaDigitalHeroSection;
