
import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, Heart, Star, Users } from 'lucide-react';

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
  const [isHovered, setIsHovered] = useState(false);
  const animationRef = useRef<number | null>(null);
  const hasAnimated = useRef(false);

  const animate = () => {
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
  };

  useEffect(() => {
    if (isInView && !hasAnimated.current) {
      const timer = setTimeout(() => {
        animate();
        hasAnimated.current = true;
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [isInView, value, delay]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  return (
    <div 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
      className={`glass-card p-8 rounded-[2.5rem] border border-white/5 group hover:border-blue-500/20 hover:bg-white/[0.05] transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] cursor-default relative overflow-hidden ${
        isInView 
          ? 'opacity-100 translate-y-0 blur-0 scale-100' 
          : 'opacity-0 translate-y-20 blur-md scale-90'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className={`absolute -right-8 -top-8 w-32 h-32 ${color} opacity-[0.03] blur-3xl group-hover:opacity-[0.1] transition-opacity duration-700`}></div>
      
      <div className="flex flex-col items-center text-center relative z-10">
        <div className={`mb-6 w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500`}>
          {React.cloneElement(icon as React.ReactElement<any>, { className: `w-8 h-8 ${isHovered ? 'animate-pulse' : ''}` })}
        </div>
        
        <div className="text-5xl font-extrabold mb-3 tracking-tighter">
          <span className="gradient-text">{count}</span>
          <span className="text-blue-500">{suffix}</span>
        </div>
        
        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em]">{label}</p>
        
        <div className={`mt-6 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent transition-all duration-1000 ease-out ${isInView ? 'w-full opacity-100' : 'w-0 opacity-0'}`}
             style={{ transitionDelay: `${delay + 500}ms` }}
        ></div>
      </div>
    </div>
  );
};

export const SuccessStats: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { 
        threshold: 0.1,
        rootMargin: "0px 0px 0px 0px" 
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const stats = [
    { 
      icon: <TrendingUp className="text-emerald-500" />, 
      label: "Aumento Ventas", 
      value: 45, 
      suffix: "%", 
      color: "bg-emerald-500" 
    },
    { 
      icon: <Heart className="text-rose-500" />, 
      label: "Satisfacción", 
      value: 98, 
      suffix: "%", 
      color: "bg-rose-500" 
    },
    { 
      icon: <Star className="text-amber-500" />, 
      label: "Reseñas Google", 
      value: 1200, 
      suffix: "+", 
      color: "bg-amber-500" 
    },
    { 
      icon: <Users className="text-blue-500" />, 
      label: "Clientes Felices", 
      value: 850, 
      suffix: "+", 
      color: "bg-blue-500" 
    }
  ];

  return (
    <div className="container mx-auto px-6" ref={sectionRef}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, idx) => (
          <StatCard 
            key={idx}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            suffix={stat.suffix}
            color={stat.color}
            isInView={isVisible}
            delay={idx * 150}
          />
        ))}
      </div>
    </div>
  );
};
