import React from "react";
import {
  ArrowRight,
  Play,
  CheckCircle2,
  Sparkles,
  Volume2,
} from "lucide-react";
import { useLanguage } from "@shared/context/LanguageContext";

export const Hero: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="relative pt-32 pb-20 overflow-hidden min-h-[90vh] flex items-center">
      <div
        className="absolute top-1/4 right-0 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-[var(--color-accent)]/10 blur-[150px] rounded-full -mr-48 animate-drift"
        aria-hidden="true"
      ></div>

      <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10">
        <div className="max-w-2xl">
          <div className="reveal-1 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-accent-subtle)] border border-[var(--color-accent-border)] text-[var(--color-primary)] text-xs font-bold mb-8 tracking-wider uppercase">
            <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse"></div>
            {t.heroEyebrow}
          </div>

          <h1 className="reveal-2 text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-extrabold leading-[1.05] mb-8 tracking-tight">
            {t.heroTitle} <br />
            <span className="text-[var(--color-primary)]">
              {t.heroTitleAccent}
            </span>
          </h1>

          <p className="reveal-3 text-xl text-muted mb-12 leading-relaxed max-w-xl">
            {t.heroSubtitle}
          </p>

          <div className="reveal-3 flex flex-wrap gap-5">
            <button
              onClick={() =>
                document
                  .querySelector("#contacto")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)] text-[var(--color-on-accent)] px-6 md:px-10 py-4 md:py-5 rounded-2xl font-bold flex items-center gap-3 transition-all shadow-xl motion-safe:active:scale-95 group min-h-[44px]"
            >
              {t.heroButtonContact}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() =>
                document
                  .querySelector("#soluciones")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="bg-[var(--color-overlay-subtle)] hover:bg-[var(--color-overlay-medium)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)] border border-[var(--color-border)] px-6 md:px-10 py-4 md:py-5 rounded-2xl font-bold flex items-center gap-3 transition-all motion-safe:active:scale-95 group min-h-[44px]"
            >
              {t.heroButtonDemo}
              <div className="w-8 h-8 bg-[var(--color-overlay-medium)] rounded-full flex items-center justify-center group-hover:bg-[var(--color-overlay-strong)] transition-colors">
                <Play className="w-3 h-3 fill-[var(--color-text)] ml-0.5" />
              </div>
            </button>
          </div>
        </div>

        <div
          className="relative hidden lg:flex justify-center lg:justify-end reveal-1"
          aria-hidden="true"
        >
          <div className="relative w-full max-w-md aspect-[3/4] bg-[var(--color-surface)] rounded-[3rem] p-10 border border-[var(--color-border)] glow-blue shimmer animate-float-fancy">
            <div className="flex justify-between items-start mb-16">
              <div className="w-12 h-12 bg-[var(--color-accent-subtle)] rounded-2xl flex items-center justify-center text-[var(--color-primary)]">
                <Volume2 className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2 bg-[var(--color-success-bg)] border border-[var(--color-success-border)] px-4 py-1.5 rounded-full text-xs text-[var(--color-success-text)] font-extrabold tracking-widest uppercase">
                <CheckCircle2 className="w-3.5 h-3.5" />
                NFC Active
              </div>
            </div>

            <div className="flex flex-col items-center text-center space-y-8">
              <div className="relative">
                <div className="relative w-20 h-20 bg-[var(--color-accent)] rounded-[1.5rem] flex items-center justify-center shadow-lg transform -rotate-6">
                  <Sparkles className="text-[var(--color-on-accent)] w-10 h-10" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-extrabold mb-1 text-default">
                  SmartConnect
                </div>
                <div className="text-muted text-xs font-bold tracking-[0.2em] uppercase">
                  Enterprise AI Node
                </div>
              </div>
            </div>

            <div className="mt-20 space-y-5">
              <div className="h-1.5 w-full bg-[var(--color-overlay-subtle)] rounded-full overflow-hidden">
                <div className="h-full w-2/3 bg-[var(--color-accent)] rounded-full"></div>
              </div>
              <div className="flex justify-between text-xs text-muted tracking-widest uppercase font-medium">
                <span className="flex items-center gap-1.5">
                  <div className="w-1 h-1 bg-[var(--color-primary)] rounded-full"></div>
                  ID: 8493-XJ
                </span>
                <span className="text-[var(--color-primary)]">
                  Protocol v2.5
                </span>
              </div>
            </div>

            <div
              className="absolute -left-16 top-1/3 bg-[var(--color-accent)] border border-[var(--color-accent)]/50 backdrop-blur-xl px-6 py-4 rounded-2xl flex items-center gap-4 shadow-[0_20px_50px_rgba(37,99,235,0.4)] animate-float-fancy"
              style={{ animationDelay: "-2s" }}
            >
              <div className="w-8 h-8 bg-[var(--color-overlay-strong)] rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[var(--color-on-accent)]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-[var(--color-on-accent-muted)] uppercase tracking-tighter">
                  AI Core
                </span>
                <span className="text-xs font-bold text-[var(--color-on-accent)]">
                  Procesando...
                </span>
              </div>
            </div>

            <div
              className="absolute -right-12 bottom-1/4 bg-[var(--color-surface)] border border-[var(--color-border)] backdrop-blur-md p-4 rounded-2xl flex flex-col gap-1 shadow-lg animate-float-fancy"
              style={{ animationDelay: "-4s" }}
            >
              <div className="flex gap-1">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-6 h-1 bg-[var(--color-primary)]/40 rounded-full"
                  ></div>
                ))}
              </div>
              <span className="text-[9px] text-muted font-medium">
                Uplink Stable
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
