
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TrendingUp, Heart, Star, Users } from 'lucide-react';
import { useIntersectionObserver } from '@shared/hooks';

interface StatProps {
  icon: React.ReactElement;
  label: string;
  value: number;
  suffix: string;
  color: string;
  isInView: boolean;
  delay: number;
  prominent?: boolean;
}

const StatCard: React.FC<StatProps> = ({ icon, label, value, suffix, color, isInView, delay, prominent }) => {
  const [count, setCount] = useState(0);
  const animationRef = useRef<number | null>(null);
  const hasAnimated = useRef(false);

  const animate = useCallback(() => {
    // Respect reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCount(value);
      return;
    }

    const duration = 2000;
    const start = performance.now();

    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const easeOutExpo = (t: number) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      const currentCount = Math.floor(easeOutExpo(progress) * value);

      setCount(currentCount);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(step);
      }
    };

    animationRef.current = requestAnimationFrame(step);
  }, [value]);

  useEffect(() => {
    if (isInView && !hasAnimated.current) {
      const timer = setTimeout(() => {
        animate();
        hasAnimated.current = true;
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [isInView, value, delay, animate]);

  return (
    <div
      className={`glass-card p-8 rounded-[2.5rem] border border-[var(--color-border)] group hover:border-[var(--color-accent-border)] hover:bg-[var(--color-overlay-subtle)] transition-all duration-1000 ease-out relative overflow-hidden min-w-0 ${
        isInView 
          ? 'opacity-100 translate-y-0 blur-0 scale-100' 
          : 'opacity-0 translate-y-20 blur-md scale-90'
      } ${prominent ? 'lg:p-12' : ''}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className={`absolute -right-8 -top-8 w-32 h-32 ${color} opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-700`}></div>
      
      <div className="flex flex-col items-center text-center relative z-10">
        <div className={`mb-6 bg-[var(--color-surface)] rounded-2xl flex items-center justify-center motion-safe:group-hover:scale-110 motion-safe:group-hover:rotate-6 transition-transform duration-500 ${prominent ? 'w-20 h-20 lg:w-24 lg:h-24' : 'w-16 h-16'}`}>
          {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: prominent ? 'w-10 h-10 lg:w-12 lg:h-12' : 'w-8 h-8' })}
        </div>
        
        <div className={`font-extrabold mb-3 tracking-tighter ${prominent ? 'text-6xl lg:text-7xl' : 'text-5xl'}`} aria-label={`${label}: ${value}${suffix}`}>
          <span className="text-[var(--color-primary)]">{count}</span>
          <span className="text-[var(--color-icon-blue)]">{suffix}</span>
        </div>
        
        <p className="text-muted text-xs font-bold uppercase tracking-[0.2em] text-wrap">{label}</p>
        
        <div className={`mt-6 h-[2px] bg-[var(--color-accent)]/50 transition-all duration-1000 ease-out ${isInView ? 'w-full opacity-100' : 'w-0 opacity-0'}`}
             style={{ transitionDelay: `${delay + 500}ms` }}
        ></div>
      </div>
    </div>
  );
};

export const SuccessStats: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(sectionRef);

  const stats = [
    { 
      icon: <TrendingUp className="text-[var(--color-icon-emerald)]" />,
      label: "Aumento Ventas",
      value: 45,
      suffix: "%",
      color: "bg-[var(--color-icon-emerald)]",
      delay: 0
    },
    { 
      icon: <Heart className="text-[var(--color-icon-rose)]" />,
      label: "Satisfacción",
      value: 98,
      suffix: "%",
      color: "bg-[var(--color-icon-rose)]",
      delay: 150
    },
    { 
      icon: <Star className="text-[var(--color-icon-amber)]" />,
      label: "Reseñas Google",
      value: 1200,
      suffix: "+",
      color: "bg-[var(--color-icon-amber)]",
      delay: 300
    },
    { 
      icon: <Users className="text-[var(--color-icon-blue)]" />,
      label: "Clientes Felices",
      value: 850,
      suffix: "+",
      color: "bg-[var(--color-icon-blue)]",
      delay: 450
    }
  ];

  return (
    <div className="container mx-auto px-6" ref={sectionRef}>
      <h2 className="sr-only">Casos de Éxito en Números</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
        <div className="md:col-span-2 lg:col-span-4">
          <StatCard 
            icon={stats[0].icon}
            label={stats[0].label}
            value={stats[0].value}
            suffix={stats[0].suffix}
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
            value={stats[1].value}
            suffix={stats[1].suffix}
            color={stats[1].color}
            isInView={isVisible}
            delay={stats[1].delay}
          />
          <StatCard 
            icon={stats[2].icon}
            label={stats[2].label}
            value={stats[2].value}
            suffix={stats[2].suffix}
            color={stats[2].color}
            isInView={isVisible}
            delay={stats[2].delay}
          />
        </div>
        <div className="md:col-span-1 lg:col-span-4">
          <StatCard 
            icon={stats[3].icon}
            label={stats[3].label}
            value={stats[3].value}
            suffix={stats[3].suffix}
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
