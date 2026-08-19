import React from "react";
import { ArrowRight, Play } from "lucide-react";
import { useLanguage } from "@shared/context/LanguageContext";
import { DotField } from "@shared/presentation/components/DotField";

export const Hero: React.FC = () => {
  const { t } = useLanguage();

  const heroTitle = t.heroTitle;
  const heroTitleAccent = t.heroTitleAccent;
  const heroTitleEnd = t.heroTitleEnd;

  return (
    <div className="relative pt-32 pb-20 overflow-hidden min-h-[100dvh] flex items-center">
      <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10">
        <div className="max-w-2xl">
          <div className="reveal-1 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-accent-subtle)] border border-[var(--color-accent-border)] text-[var(--color-primary)] text-xs font-bold mb-8 tracking-wider uppercase">
            <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse"></div>
            {t.heroEyebrow}
          </div>

          <h1 className="reveal-2 text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-extrabold leading-[1.1] mb-8 tracking-tight">
            {heroTitle}{" "}
            <span className="text-[var(--color-primary)]">
              {heroTitleAccent}
            </span>{" "}
            {heroTitleEnd}
          </h1>

          <p className="reveal-3 text-xl text-muted mb-12 leading-relaxed max-w-xl">
            {t.heroSubtitle}
          </p>

          <div className="reveal-3 flex flex-wrap gap-5">
            <button
              type="button"
              onClick={() =>
                document
                  .querySelector("#contacto")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="btn-primary group"
            >
              {t.heroButtonContact}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-150 ease-[var(--ease-out)]" />
            </button>
            <button
              type="button"
              onClick={() =>
                document
                  .querySelector("#soluciones")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="btn-secondary group"
            >
              {t.heroButtonDemo}
              <div className="w-8 h-8 bg-[var(--color-overlay-medium)] rounded-full flex items-center justify-center group-hover:bg-[var(--color-overlay-strong)] transition-[background-color] duration-150">
                <Play className="w-3 h-3 fill-[var(--color-text)] ml-0.5" />
              </div>
            </button>
          </div>
        </div>

        <div
          className="relative hidden lg:flex justify-center lg:justify-end reveal-1"
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
                <g className="animate-float-fancy">
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
                <g className="animate-float-fancy" style={{ animationDelay: "-1.2s" }}>
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
                <g className="animate-float-fancy" style={{ animationDelay: "-3s" }}>
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
                <g className="animate-float-fancy" style={{ animationDelay: "-2.1s" }}>
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
