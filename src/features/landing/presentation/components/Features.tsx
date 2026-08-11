import React, { useRef, useState, useEffect } from "react";
import { Smartphone, Utensils, ArrowUpRight } from "lucide-react";
import { useIntersectionObserver } from "@shared/hooks";
import { useLanguage, Translation } from "@shared/context/LanguageContext";
import { SOLUTIONS } from "@shared/config/solutions";

// Features-specific presentation metadata per solution id. Marketing copy
// here intentionally differs from the compact Navbar dropdown copy, so it
// stays local instead of living on SolutionConfig.
const FEATURES_PRESENTATION: Record<
  string,
  {
    icon: React.ReactNode;
    titleKey: keyof Translation;
    descriptionKey: keyof Translation;
    hasImage?: boolean;
    hasVideo?: boolean;
  }
> = {
  "carta-digital": {
    icon: <Utensils className="w-6 h-6 text-[var(--color-icon-emerald)]" />,
    titleKey: "featuresCartaDigital",
    descriptionKey: "featuresCartaDigitalDesc",
    hasVideo: true,
  },
  "tarjetas-nfc": {
    icon: <Smartphone className="w-6 h-6 text-[var(--color-icon-emerald)]" />,
    titleKey: "featuresNFC",
    descriptionKey: "featuresNFCDesc",
    hasImage: true,
  },
};

const solutions = SOLUTIONS.map((solution) => ({
  id: solution.id,
  href: solution.href,
  serviceValue: solution.serviceValue,
  ...FEATURES_PRESENTATION[solution.id],
}));

const getCardBackground = (
  itemHasImage: boolean | undefined,
  idx: number,
): string => {
  if (itemHasImage && idx === 0)
    return "bg-[var(--color-bg-alt)] lg:col-span-2 lg:row-span-2";
  if (idx === 0) return "bg-[var(--color-surface)] lg:col-span-2 lg:row-span-2";
  return "bg-[var(--color-bg-alt)]";
};

const getCardHeadingClass = (idx: number): string => {
  return `font-bold mb-4 text-default ${idx === 0 ? "text-3xl lg:text-4xl" : "text-xl lg:text-2xl"}`;
};

const getCardDescClass = (idx: number): string => {
  return `text-muted leading-relaxed mb-6 ${idx === 0 ? "text-lg" : ""}`;
};

const getIconContainerClass = (idx: number): string => {
  return `relative z-10 mb-6 w-14 h-14 bg-[var(--color-surface)] rounded-2xl flex items-center justify-center motion-safe:group-hover:scale-110 transition-transform duration-150 ease-[var(--ease-out)] ${idx === 0 ? "lg:w-16 lg:h-16" : ""}`;
};

const getLinkText = (t: Translation): string => t.featuresDetails;

const VideoPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inViewport = useIntersectionObserver(containerRef, { threshold: 0.2 });

  // Start playing when video enters viewport
  useEffect(() => {
    if (inViewport && !isVisible) {
      setIsVisible(true);
      if (videoRef.current) {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [inViewport, isVisible]);

  const toggle = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative bg-[var(--color-bg)] rounded-2xl overflow-hidden"
    >
      <video
        ref={videoRef}
        src="/assets/video.mp4"
        preload={isVisible ? "auto" : "none"}
        loop
        muted
        playsInline
        className="w-full max-w-full aspect-[4/3] sm:aspect-video object-cover"
      />
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
        <button
          type="button"
          onClick={toggle}
          className="w-8 h-8 rounded-full bg-[var(--color-overlay-strong)]/80 backdrop-blur-sm flex items-center justify-center hover:bg-[var(--color-overlay-strong)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-text)]"
          aria-label={isPlaying ? "Pausar video" : "Reanudar video"}
        >
          {isPlaying ? (
            <svg
              className="w-3.5 h-3.5 text-[var(--color-text)]"
              fill="var(--color-text)"
              viewBox="0 0 24 24"
            >
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg
              className="w-3.5 h-3.5 text-[var(--color-text)] ml-0.5"
              fill="var(--color-text)"
              viewBox="0 0 24 24"
            >
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
        </button>
        <div className="px-2 py-1 bg-[var(--color-overlay-strong)]/80 backdrop-blur rounded text-xs text-[var(--color-text)]/80">
          ▶ Ejemplo de plato
        </div>
      </div>
    </div>
  );
};

export const Features: React.FC = () => {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(sectionRef, {
    rootMargin: "0px 0px -50px 0px",
  });

  return (
    <div className="container mx-auto px-6" ref={sectionRef}>
      <div
        className={`text-left max-w-none mb-20 transition-[opacity,transform] duration-500 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          {t.featuresTitle}
        </h2>
        <p className="text-muted leading-relaxed">{t.featuresSubtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
        {solutions.map((item, idx) => (
          <article
            key={item.id}
            className={`relative p-8 lg:p-10 rounded-3xl transition-[opacity,transform] duration-300 cursor-pointer group overflow-hidden ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            } ${getCardBackground(item.hasImage, idx)}`}
            style={{ transitionDelay: `${idx * 60}ms` }}
          >
            <div className={getIconContainerClass(idx)}>{item.icon}</div>
            <h3 className={getCardHeadingClass(idx)}>
              {t[item.titleKey as keyof typeof t]}
            </h3>
            <p className={getCardDescClass(idx)}>
              {t[item.descriptionKey as keyof typeof t]}
            </p>

            {item.hasImage && (
              <div className="relative z-10 mt-4 rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-lg">
                <img
                  src="/assets/Tarjeta_NFC_negra_MontesTAP.webp"
                  alt={t.seoAltTextNFC}
                  width="400"
                  height="400"
                  loading="lazy"
                  className="w-full h-auto object-cover"
                />
              </div>
            )}

            {item.hasVideo && (
              <div className="relative z-10 mt-4 rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-lg group/video">
                <div className="relative bg-[var(--color-bg)] rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 pointer-events-none z-10 border-[8px] md:border-[12px] border-[var(--color-bg-alt)] rounded-2xl"></div>
                  <div className="absolute top-0 left-0 right-0 h-6 md:h-8 bg-gradient-to-b from-[var(--color-bg)]/50 to-transparent z-10"></div>
                  <div className="absolute bottom-0 left-0 right-0 h-6 md:h-8 bg-gradient-to-t from-[var(--color-bg)]/50 to-transparent z-10"></div>
                  <VideoPlayer />
                </div>
              </div>
            )}

            <a
              href={item.href}
              className="inline-flex items-center gap-2 text-sm font-bold text-[var(--color-primary)] group-hover:text-[var(--color-primary)] transition-[color] duration-150"
            >
              <span>{getLinkText(t)}</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-150 ease-[var(--ease-out)]" />
            </a>
          </article>
        ))}
      </div>

      {/* Descriptive content for SEO — editorial numbered layout */}
      <div className="mt-28 border-t border-[var(--color-border)]">
        {(
          [
            { num: "01", title: t.featuresContent1Title, content: t.featuresContent1 },
            { num: "02", title: t.featuresContent2Title, content: t.featuresContent2 },
            { num: "03", title: t.featuresContent3Title, content: t.featuresContent3 },
            { num: "04", title: t.featuresContent4Title, content: t.featuresContent4 },
            { num: "05", title: t.featuresContent5Title, content: t.featuresContent5 },
            { num: "06", title: t.featuresContent6Title, content: t.featuresContent6 },
          ] as const
        ).map((item) => (
          <div
            key={item.num}
            className="grid grid-cols-[2.5rem_1fr] md:grid-cols-[6rem_1fr] gap-4 md:gap-12 py-10 border-b border-[var(--color-border)]"
          >
            <span className="text-[var(--color-primary)] font-mono text-xs font-bold opacity-50 pt-1.5 tabular-nums select-none">
              {item.num}
            </span>
            <div className="md:grid md:grid-cols-[15rem_1fr] md:gap-10 items-start">
              <h3 className="text-base md:text-lg font-bold text-default mb-2 md:mb-0 leading-snug">
                {item.title}
              </h3>
              <p className="text-muted leading-relaxed text-base max-w-[65ch]">
                {item.content}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
