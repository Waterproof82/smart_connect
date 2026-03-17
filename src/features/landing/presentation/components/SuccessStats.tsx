
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
}

const StatCard: React.FC<StatProps> = ({ icon, label, value, suffix, color, isInView, delay }) => {
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
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className={`absolute -right-8 -top-8 w-32 h-32 ${color} opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-700`}></div>
      
      <div className="flex flex-col items-center text-center relative z-10">
        <div className={`mb-6 w-16 h-16 bg-[var(--color-surface)] rounded-2xl flex items-center justify-center motion-safe:group-hover:scale-110 motion-safe:group-hover:rotate-6 transition-transform duration-500`}>
          {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: 'w-8 h-8' })}
        </div>
        
        <div className="text-5xl font-extrabold mb-3 tracking-tighter" aria-label={`${label}: ${value}${suffix}`}>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat) => (
          <StatCard 
            key={stat.label}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            suffix={stat.suffix}
            color={stat.color}
            isInView={isVisible}
            delay={stat.delay}
          />
        ))}
      </div>
    </div>
  );
};
