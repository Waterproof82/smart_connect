/**
 * MenuInfo Component
 * @module features/qribar/presentation/components
 * 
 * Pure presentational component - displays menu information and benefits
 * Follows SRP: Single responsibility - render info section
 */

import React from 'react';
import { Utensils, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@shared/context/LanguageContext';

interface MenuInfoProps {
  isVisible: boolean;
}

export const MenuInfo: React.FC<MenuInfoProps> = ({ isVisible }) => {
  const { t } = useLanguage();
  
  const benefits = [
    t.qribarBenefit1,
    t.qribarBenefit2,
    t.qribarBenefit3,
    t.qribarBenefit4
  ];

  return (
    <div className={`transition-all duration-1000 ease-out ${
      isVisible ? 'opacity-100 translate-x-0 blur-0' : 'opacity-0 translate-x-20 blur-md'
    }`}>
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-highlight-subtle)] border border-[var(--color-highlight-border)] text-[var(--color-highlight)] text-xs font-semibold mb-6">
        <Utensils className="w-3.5 h-3.5" />
        {t.qribarSector}
      </div>
      
      <h2 className="text-5xl font-extrabold mb-8 leading-tight">
        {t.qribarTitle} <span className="text-[var(--color-highlight)]">QRIBAR</span>
      </h2>

      <p className="text-lg text-muted mb-10 leading-relaxed">
        {t.qribarSubtitle}
      </p>

      <div className="space-y-6 mb-12">
        {benefits.map((text, i) => (
          <div 
            key={text} 
            className="flex items-center gap-3 transition-all duration-700"
            style={{ 
              transitionDelay: `${isVisible ? (400 + (i * 150)) : 0}ms`,
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateX(0)' : 'translateX(20px)'
            }}
          >
            <div className="w-6 h-6 bg-[var(--color-highlight-subtle)] rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-[var(--color-highlight)]" />
            </div>
            <span className="text-default font-medium">{text}</span>
          </div>
        ))}
      </div>

      <a 
        href="https://www.qribar.es" 
        target="_blank" 
        rel="noopener noreferrer"
        className={`inline-block bg-[var(--color-highlight)] hover:opacity-90 text-[var(--color-bg)] px-10 py-4 rounded-xl font-bold transition-all shadow-xl shadow-[var(--color-highlight)]/20 motion-safe:active:scale-95 delay-1000 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
        }`}
      >
        {t.qribarButton}
      </a>
    </div>
  );
};
