import React, { useState, useEffect, useRef, useCallback } from "react";
import { TrendingUp, Heart, Star, Users, Quote } from "lucide-react";
import { useIntersectionObserver } from "@shared/hooks";
import { useLanguage } from "@shared/context/LanguageContext";

interface StatProps {
  icon: React.ReactElement;
  label: string;
  quote: string;
  author: string;
  color: string;
  isInView: boolean;
  delay: number;
  prominent?: boolean;
}

const StatCard: React.FC<StatProps> = ({
  icon,
  label,
  quote,
  author,
  color,
  isInView,
  delay,
  prominent,
}) => {
  const [count, setCount] = useState(0);
  const animationRef = useRef<number | null>(null);
  const hasAnimated = useRef(false);

  const animate = useCallback(() => {
    if (globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCount(45);
      return;
    }

    const duration = 2000;
    const start = performance.now();

    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const easeOutExpo = (t: number) =>
        t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      const currentCount = Math.floor(easeOutExpo(progress) * 45);

      setCount(currentCount);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(step);
      }
    };

    animationRef.current = requestAnimationFrame(step);
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (isInView && !hasAnimated.current) {
      const timer = setTimeout(() => {
        if (isMounted) {
          animate();
          hasAnimated.current = true;
        }
      }, delay);
      return () => {
        clearTimeout(timer);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
    return () => {
      isMounted = false;
    };
  }, [isInView, delay, animate]);

  return (
    <div
      className={`p-8 rounded-[2.5rem] group hover:border-[var(--color-accent-border)] hover:shadow-lg hover:-translate-y-1 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] relative overflow-hidden min-w-0 ${
        isInView
          ? "opacity-100 translate-y-0 blur-0 scale-100"
          : "opacity-0 translate-y-20 blur-md scale-90"
      } ${
        prominent
          ? "bg-[var(--color-surface)] border-2 border-[var(--color-primary)]/30 lg:p-12"
          : "bg-[var(--color-bg-alt)] border border-[var(--color-border)]"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div
        className={`absolute -right-8 -top-8 w-32 h-32 ${color} opacity-[0.03] group-hover:opacity-[0.08] blur-2xl transition-all duration-700`}
      ></div>

      <div className="flex flex-col items-center text-center relative z-10">
        <div
          className={`mb-6 bg-[var(--color-surface)] rounded-2xl flex items-center justify-center motion-safe:group-hover:scale-110 motion-safe:group-hover:rotate-6 transition-transform duration-500 ${prominent ? "w-20 h-20 lg:w-24 lg:h-24" : "w-16 h-16"}`}
        >
          {React.cloneElement(
            icon as React.ReactElement<{ className?: string }>,
            { className: prominent ? "w-10 h-10 lg:w-12 lg:h-12" : "w-8 h-8" },
          )}
        </div>

        <div
          className={`font-extrabold mb-3 tracking-tighter ${prominent ? "text-4xl lg:text-5xl" : "text-3xl"}`}
          aria-label={`${label}: ${count}%`}
        >
          <span className="text-[var(--color-primary)]">{count}%</span>
        </div>

        <p className="text-muted text-xs font-bold uppercase tracking-[0.2em] text-wrap mb-4">
          {label}
        </p>

        {quote && (
          <div className="relative max-w-xs">
            <Quote className="absolute -top-2 -left-1 w-4 h-4 text-[var(--color-accent)] opacity-50" />
            <p className="text-sm text-default italic pl-4 leading-relaxed">
              {quote}
            </p>
            <p className="text-xs text-muted mt-2 font-medium">— {author}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export const SuccessStats: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(sectionRef);
  const { t } = useLanguage();

  const stats = [
    {
      icon: <TrendingUp className="text-[var(--color-icon-emerald)]" />,
      label: t.successStat1Label,
      quote: t.successStat1Quote,
      author: t.successStat1Author,
      color: "bg-[var(--color-icon-emerald)]",
      delay: 0,
    },
    {
      icon: <Heart className="text-[var(--color-icon-rose)]" />,
      label: t.successStat2Label,
      quote: t.successStat2Quote,
      author: t.successStat2Author,
      color: "bg-[var(--color-icon-rose)]",
      delay: 150,
    },
    {
      icon: <Star className="text-[var(--color-icon-amber)]" />,
      label: t.successStat3Label,
      quote: t.successStat3Quote,
      author: t.successStat3Author,
      color: "bg-[var(--color-icon-amber)]",
      delay: 300,
    },
    {
      icon: <Users className="text-[var(--color-icon-blue)]" />,
      label: t.successStat4Label,
      quote: t.successStat4Quote,
      author: t.successStat4Author,
      color: "bg-[var(--color-icon-blue)]",
      delay: 450,
    },
  ];

  return (
    <div className="container mx-auto px-6" ref={sectionRef}>
      <div className="text-center mb-12 md:mb-16">
        <div className="text-xs font-bold tracking-[0.3em] text-[var(--color-primary)] uppercase mb-3 md:mb-4">
          {t.successTitle}
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-[1.15] mb-4 md:mb-6 font-display">
          {t.successSubtitle}
        </h2>
        <p className="text-base text-muted leading-relaxed max-w-2xl mx-auto">
          {t.successDesc}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
        <div className="md:col-span-2 lg:col-span-4">
          <StatCard
            icon={stats[0].icon}
            label={stats[0].label}
            quote={stats[0].quote}
            author={stats[0].author}
            color={stats[0].color}
            isInView={isVisible}
            delay={stats[0].delay}
            prominent
          />
        </div>
        <div className="md:col-span-1 lg:col-span-4 grid gap-6">
          <StatCard
            icon={stats[1].icon}
            label={stats[1].label}
            quote={stats[1].quote}
            author={stats[1].author}
            color={stats[1].color}
            isInView={isVisible}
            delay={stats[1].delay}
          />
          <StatCard
            icon={stats[2].icon}
            label={stats[2].label}
            quote={stats[2].quote}
            author={stats[2].author}
            color={stats[2].color}
            isInView={isVisible}
            delay={stats[2].delay}
          />
        </div>
        <div className="md:col-span-1 lg:col-span-4">
          <StatCard
            icon={stats[3].icon}
            label={stats[3].label}
            quote={stats[3].quote}
            author={stats[3].author}
            color={stats[3].color}
            isInView={isVisible}
            delay={stats[3].delay}
            prominent
          />
        </div>
      </div>
    </div>
  );
};
