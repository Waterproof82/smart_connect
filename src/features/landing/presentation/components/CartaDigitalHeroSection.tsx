import React from "react";
import { MapPin } from "lucide-react";
import { useLanguage } from "@shared/context/LanguageContext";
import { WhatsAppCta } from "@shared/presentation/layout";
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
      className="ds-hero relative overflow-hidden bg-[var(--color-bg)]"
    >
      <DotField
        className="absolute inset-x-0 bottom-0 h-1/2"
        mask="radial-gradient(ellipse 70% 100% at 50% 100%, black 55%, transparent 80%)"
      />

      <div className="ds-container relative z-10">
        {/* Same grammar as PageHero: title column left, lede + CTAs right. */}
        <div className="ds-hero__grid">
          <div className="grid gap-[var(--space-sm)] min-w-0">
            {/* The page's only h1: keyword wording (was an sr-only h1 in
                CartaDigitalPage), shown as the label above the slogan. */}
            <h1 className="ds-kicker text-lg md:text-xl [text-wrap:balance]">
              {t.cartaPageH1}
            </h1>
            <p className="ds-h1 m-0">
              {t.cartaHeroTitle1}{" "}
              <span className="text-[var(--color-primary)]">
                {t.cartaHeroTitleAccent}
              </span>{" "}
              {t.cartaHeroTitle2}
            </p>
          </div>

          <div className="ds-hero__aside">
            <p className="flex items-start gap-1.5 text-sm text-muted m-0">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
              {t.cartaHeroTenerife}
            </p>
            <p className="ds-lede">{t.cartaHeroSubtitle}</p>
            <div className="ds-actions">
              <WhatsAppCta message={t.waMsgCarta} servicio="Carta Digital" />
              <button
                type="button"
                onClick={() => onScrollToSection("demo")}
                className="btn-ghost"
              >
                {t.cartaHeroButtonDemo}
              </button>
              <button
                type="button"
                onClick={() => onScrollToSection("dinero")}
                className="btn-ghost"
              >
                {t.cartaHeroButtonCalc}
              </button>
            </div>
          </div>
        </div>

        <dl className="grid grid-cols-2 md:grid-cols-4 gap-[var(--space-md)] mt-[var(--space-2xl)] pt-[var(--space-lg)] border-t border-[var(--color-border)] m-0">
          {[
            { num: "5", label: t.cartaHeroStat1Label },
            { num: "0%", label: t.cartaHeroStat2Label },
            { num: "24/7", label: t.cartaHeroStat3Label },
            { num: "∞", label: t.cartaHeroStat4Label },
          ].map((stat) => (
            <div key={stat.num} className="flex flex-col-reverse gap-1">
              <dt className="text-sm text-muted">{stat.label}</dt>
              <dd className="m-0 font-display text-3xl md:text-4xl font-bold text-default tabular-nums">
                {stat.num}
              </dd>
            </div>
          ))}
        </dl>

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
            <g data-motif="">
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
              data-motif=""
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
              data-motif=""
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
            <g data-motif="">
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
