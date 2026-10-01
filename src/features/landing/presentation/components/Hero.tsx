import React from "react";
import { ArrowDown } from "lucide-react";
import { useLanguage } from "@shared/context/LanguageContext";
import { DotField } from "@shared/presentation/components/DotField";
import { WhatsAppCta } from "@shared/presentation/layout";

/**
 * Home hero (design.md § Marquee Hero). The h1 is the LCP element: it is
 * never animated. Both CTAs are real links so crawlers can follow them.
 */
export const Hero: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="ds-hero relative overflow-hidden lg:min-h-[88dvh] flex items-center">
      <div className="ds-container grid lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] gap-[var(--space-2xl)] items-center relative z-10 w-full">
        <div className="grid gap-[var(--space-lg)] min-w-0">
          <h1 className="ds-h1">
            {t.heroTitle}{" "}
            <span className="text-[var(--color-primary)]">
              {t.heroTitleAccent}
            </span>{" "}
            {t.heroTitleEnd}
          </h1>

          <p className="ds-lede">{t.heroSubtitle}</p>

          <div className="ds-actions">
            <WhatsAppCta label={t.heroButtonContact} />
            <a href="/#soluciones" className="btn-ghost">
              {t.heroButtonDemo}
              <ArrowDown className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>

          <p className="text-sm text-muted m-0">{t.heroAudience}</p>
        </div>

        <div
          className="relative hidden lg:flex justify-center lg:justify-end"
          aria-hidden="true"
        >
          <div className="relative w-full max-w-md">
            {/* Ticket-paper dot field, replaces the old blurred glow */}
            <DotField className="absolute -inset-[8%] rounded-full" />

            {/* Illustrated bar counter: QR tent card, order phone, NFC tap, chatbot */}
            <svg
              viewBox="0 0 420 460"
              className="relative w-full h-auto"
              aria-hidden="true"
            >
              <rect
                x="10"
                y="300"
                width="400"
                height="150"
                rx="18"
                fill="var(--color-surface)"
                stroke="var(--color-border)"
                strokeWidth="1.5"
              />
              <rect
                x="10"
                y="300"
                width="400"
                height="14"
                rx="7"
                fill="var(--color-accent)"
              />

              {/* QR tent card */}
              <g transform="rotate(-4 96 300)">
                <g>
                  <path
                    d="M50 300 L96 210 L142 300 Z"
                    fill="var(--color-bg)"
                    stroke="var(--color-text)"
                    strokeWidth="3"
                    strokeLinejoin="round"
                  />
                  <g transform="translate(74,234)">
                    <rect
                      width="44"
                      height="44"
                      rx="4"
                      fill="var(--color-bg)"
                      stroke="var(--color-text)"
                      strokeWidth="2.5"
                    />
                    <rect x="6" y="6" width="10" height="10" fill="var(--color-text)" />
                    <rect x="28" y="6" width="10" height="10" fill="var(--color-text)" />
                    <rect x="6" y="28" width="10" height="10" fill="var(--color-text)" />
                    <rect x="20" y="20" width="6" height="6" fill="var(--color-text)" />
                    <rect x="30" y="30" width="6" height="6" fill="var(--color-text)" />
                  </g>
                </g>
              </g>

              {/* Phone with order list */}
              <g transform="rotate(2 230 300)">
                <g>
                  <rect
                    x="182"
                    y="150"
                    width="96"
                    height="170"
                    rx="16"
                    fill="var(--color-bg)"
                    stroke="var(--color-text)"
                    strokeWidth="3"
                  />
                  <rect x="192" y="168" width="76" height="8" rx="4" fill="var(--color-accent)" />
                  <rect x="192" y="186" width="56" height="6" rx="3" fill="var(--color-border)" />
                  <rect x="192" y="202" width="76" height="1.5" fill="var(--color-border)" />
                  <rect x="192" y="212" width="50" height="6" rx="3" fill="var(--color-text-muted)" />
                  <rect x="252" y="212" width="16" height="6" rx="3" fill="var(--color-icon-amber)" />
                  <rect x="192" y="226" width="60" height="6" rx="3" fill="var(--color-text-muted)" />
                  <rect x="252" y="226" width="16" height="6" rx="3" fill="var(--color-icon-amber)" />
                  <rect x="192" y="240" width="46" height="6" rx="3" fill="var(--color-text-muted)" />
                  <rect x="252" y="240" width="16" height="6" rx="3" fill="var(--color-icon-amber)" />
                  <rect x="192" y="262" width="76" height="26" rx="8" fill="var(--color-accent)" />
                  <rect x="212" y="272" width="36" height="6" rx="3" fill="var(--color-on-accent)" />
                </g>
              </g>

              {/* NFC tap card */}
              <g transform="rotate(6 336 300)">
                <g>
                  <rect
                    x="300"
                    y="252"
                    width="72"
                    height="46"
                    rx="8"
                    fill="var(--color-icon-amber)"
                    transform="rotate(-8 336 275)"
                  />
                  <g transform="rotate(-8 336 275)">
                    <path
                      d="M312 264 a10 10 0 0 1 14 14"
                      fill="none"
                      stroke="var(--color-on-accent)"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                    />
                    <path
                      d="M316 268 a5 5 0 0 1 7 7"
                      fill="none"
                      stroke="var(--color-on-accent)"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                    />
                    <circle cx="322" cy="279" r="2" fill="var(--color-on-accent)" />
                  </g>
                </g>
              </g>

              {/* Chatbot bubble */}
              <g transform="rotate(-3 96 150)">
                <g>
                  <path
                    d="M40 130 h96 a12 12 0 0 1 12 12 v40 a12 12 0 0 1 -12 12 h-58 l-20 18 4-18 h-22 a12 12 0 0 1 -12 -12 v-40 a12 12 0 0 1 12 -12 Z"
                    fill="var(--color-accent)"
                  />
                  <circle cx="68" cy="164" r="4" fill="var(--color-on-accent)" />
                  <circle cx="84" cy="164" r="4" fill="var(--color-on-accent)" />
                  <circle cx="100" cy="164" r="4" fill="var(--color-on-accent)" />
                </g>
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
