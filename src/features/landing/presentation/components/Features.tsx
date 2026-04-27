import React, { useRef } from 'react';
import { Code2, Settings2, Smartphone, Utensils, ArrowUpRight, Sparkles } from 'lucide-react';
import { useIntersectionObserver } from '@shared/hooks';
import { useLanguage } from '@shared/context/LanguageContext';

const solutions = [
  {
    id: 'software-ia',
    icon: <Code2 className="w-6 h-6 text-[var(--color-icon-blue)]" />,
    titleKey: 'featuresSoftwareIA',
    descriptionKey: 'featuresSoftwareIADesc',
    serviceValue: 'Consultoría IA',
    hasImage: true
  },
  {
    id: 'automatizacion-n8n',
    icon: <Settings2 className="w-6 h-6 text-[var(--color-icon-purple)]" />,
    titleKey: 'featuresAutomation',
    descriptionKey: 'featuresAutomationDesc',
    serviceValue: 'Automatización n8n'
  },
  {
    id: 'tarjetas-nfc',
    icon: <Smartphone className="w-6 h-6 text-[var(--color-icon-emerald)]" />,
    titleKey: 'featuresNFC',
    descriptionKey: 'featuresNFCDesc',
    serviceValue: 'Tarjetas NFC Reseñas',
    hasImage: true
  },
  {
    id: 'qribar',
    icon: <Utensils className="w-6 h-6 text-[var(--color-icon-amber)]" />,
    titleKey: 'featuresQribar',
    descriptionKey: 'featuresQribarDesc',
    serviceValue: 'QRIBAR',
    external: true,
    href: 'https://qribar.es'
  },
  {
    id: 'carta-digital',
    icon: <Utensils className="w-6 h-6 text-[var(--color-icon-emerald)]" />,
    titleKey: 'featuresCartaDigital',
    descriptionKey: 'featuresCartaDigitalDesc',
    serviceValue: 'Carta Digital Premium',
    internal: true,
    route: '/carta-digital',
    hasVideo: true
  }
];

const SoftwareIAAbstract = () => (
  <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300%] h-[300%]">
      <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-[var(--color-primary)]/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-[var(--color-icon-purple)]/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-1/3 left-1/3 w-40 h-40 bg-[var(--color-icon-blue)]/15 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
    </div>
    <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-[var(--color-primary)]"/>
        </pattern>
        <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="var(--color-icon-purple)" stopOpacity="0.1"/>
        </linearGradient>
      </defs>
      <rect width="400" height="400" fill="url(#grid)" className="text-[var(--color-border)]"/>
      <circle cx="200" cy="200" r="80" fill="none" stroke="url(#glow)" strokeWidth="1"/>
      <circle cx="200" cy="200" r="120" fill="none" stroke="url(#glow)" strokeWidth="0.5" strokeDasharray="4 8"/>
      <circle cx="200" cy="200" r="160" fill="none" stroke="url(#glow)" strokeWidth="0.3" strokeDasharray="2 12"/>
    </svg>
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative">
        <div className="flex items-center gap-1 text-[var(--color-primary)] opacity-40">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i} 
              className="w-1 bg-current rounded-full animate-pulse"
              style={{ 
                height: `${BAR_HEIGHTS[i]}px`,
                animationDelay: `${i * 0.15}s`
              }}
            />
          ))}
        </div>
        <Sparkles className="absolute -top-4 -right-8 w-6 h-6 text-[var(--color-accent)] opacity-60 animate-spin" style={{ animationDuration: '3s' }} />
      </div>
    </div>
  </div>
);

const BAR_HEIGHTS = [16, 28, 12, 24, 20];

export const Features: React.FC = () => {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(sectionRef, { rootMargin: "0px 0px -50px 0px" });

  return (
    <div className="container mx-auto px-6" ref={sectionRef}>
      <div className={`text-center max-w-3xl mx-auto mb-20 transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>
        <h2 className="text-4xl md:text-5xl font-bold mb-6">{t.featuresTitle}</h2>
        <p className="text-muted leading-relaxed">
          {t.featuresSubtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
        {solutions.map((item, idx) => (
          <article
            key={item.id}
            className={`relative p-8 lg:p-10 rounded-3xl transition-all duration-700 cursor-pointer group overflow-hidden ${
              isVisible 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-10'
            } ${
              item.hasImage && idx === 0
                ? 'bg-[var(--color-bg-alt)] lg:col-span-2 lg:row-span-2' 
                : idx === 0 
                  ? 'bg-[var(--color-surface)] lg:col-span-2 lg:row-span-2' 
                  : 'bg-[var(--color-bg-alt)]'
            }`}
            style={{ transitionDelay: `${idx * 100}ms` }}
          >
            {item.hasImage && idx === 0 && <SoftwareIAAbstract />}
            <div className={`relative z-10 mb-6 w-14 h-14 bg-[var(--color-surface)] rounded-2xl flex items-center justify-center motion-safe:group-hover:scale-110 transition-transform ${idx === 0 ? 'lg:w-16 lg:h-16' : ''}`}>
              {item.icon}
            </div>
            <h3 className={`font-bold mb-4 text-default ${idx === 0 ? 'text-3xl lg:text-4xl' : 'text-xl lg:text-2xl'}`}>{t[item.titleKey as keyof typeof t]}</h3>
            <p className={`text-muted leading-relaxed mb-6 ${idx === 0 ? 'text-lg' : ''}`}>
              {t[item.descriptionKey as keyof typeof t]}
            </p>
            
            {item.hasImage && idx === 2 && (
              <div className="relative z-10 mt-4 rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-lg">
                <img 
                  src="/assets/Tarjeta_NFC_negra_MontesTAP.webp" 
                  alt="Tarjeta NFC Tap-to-Review" 
                  className="w-full h-auto object-cover"
                />
              </div>
            )}
            
            {item.hasVideo && idx === 4 && (
              <div className="relative z-10 mt-4 rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-lg group/video">
                <div className="relative bg-black rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 pointer-events-none z-10 border-[8px] md:border-[12px] border-[#1a1a1a] rounded-2xl"></div>
                  <div className="absolute top-0 left-0 right-0 h-6 md:h-8 bg-gradient-to-b from-black/50 to-transparent z-10"></div>
                  <div className="absolute bottom-0 left-0 right-0 h-6 md:h-8 bg-gradient-to-t from-black/50 to-transparent z-10"></div>
                  <video 
                    src="/assets/video.mp4" 
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                    className="w-full aspect-video object-cover"
                  />
                  <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
                    <div className="px-2 py-1 bg-black/60 backdrop-blur rounded text-xs text-white/80">
                      ▶ Ejemplo de plato
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <a 
              href={item.internal && item.route 
                ? item.route
                : item.external && item.href 
                  ? item.href 
                  : `#contacto?servicio=${encodeURIComponent(item.serviceValue)}`
              }
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              className="inline-flex items-center gap-2 text-sm font-bold text-[var(--color-primary)] group-hover:text-[var(--color-primary)] transition-colors"
            >
              <span>{item.external ? t.featuresVisit : item.internal ? t.featuresDetails : t.featuresContact}</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </a>
          </article>
        ))}
      </div>
    </div>
  );
};