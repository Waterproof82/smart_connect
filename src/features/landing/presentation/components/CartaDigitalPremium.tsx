import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Cpu, ChevronDown, Code2, Settings2, Smartphone, Utensils, X, Menu, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@shared/context/LanguageContext';

const Navbar: React.FC<{ scrolled?: boolean }> = ({ scrolled = false }) => {
  const { t } = useLanguage();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [focusedDropdownIndex, setFocusedDropdownIndex] = useState<number>(-1);

  const solutions = [
    {
      id: 'software-ia',
      icon: <Code2 className="w-5 h-5 text-[var(--color-icon-blue)]" />,
      title: t.navbarSoftwareIA,
      desc: t.navbarSoftwareIADesc,
      href: '/#soluciones'
    },
    {
      id: 'automatizacion-n8n',
      icon: <Settings2 className="w-5 h-5 text-[var(--color-icon-purple)]" />,
      title: t.navbarAutomation,
      desc: t.navbarAutomationDesc,
      href: '/#soluciones'
    },
    {
      id: 'tarjetas-nfc',
      icon: <Smartphone className="w-5 h-5 text-[var(--color-icon-emerald)]" />,
      title: t.navbarNFC,
      desc: t.navbarNFCDesc,
      href: '/#soluciones'
    },
    {
      id: 'qribar',
      icon: <Utensils className="w-5 h-5 text-[var(--color-icon-amber)]" />,
      title: t.navbarQribar,
      desc: t.navbarQribarDesc,
      href: 'https://qribar.es',
      external: true
    }
  ];

  const handleDropdownLinkClick = (e?: React.MouseEvent<HTMLAnchorElement>) => {
    setIsDropdownOpen(false);
    if (e?.currentTarget?.href?.includes('#')) {
      const target = document.querySelector(new URL(e.currentTarget.href).hash);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav
      aria-label="Navegación principal"
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 border-b border-[var(--color-border)] bg-[var(--color-bg)] ${
        scrolled ? 'py-2 md:py-3' : 'py-3 md:py-6'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-[var(--color-accent)] rounded-xl flex items-center justify-center shadow-lg motion-safe:group-hover:scale-110 transition-transform">
            <Cpu className="text-[var(--color-on-accent)] w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tighter text-default hidden sm:block">
            SmartConnect <span className="text-[var(--color-primary)]">AI</span>
          </span>
        </Link>

        {/* Navigation - Desktop */}
        <div className="hidden md:flex items-center gap-8 lg:gap-10 text-sm font-semibold text-muted">
          <Link to="/" className="flex items-center gap-1.5 hover:text-[var(--color-text)] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            {t.navBack}
          </Link>
          <div
            className="relative group"
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => { setIsDropdownOpen(false); setFocusedDropdownIndex(-1); }}
          >
            <button
              className="flex items-center gap-1.5 hover:text-[var(--color-text)] transition-colors py-2 outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-lg"
              aria-haspopup="true"
              aria-expanded={isDropdownOpen}
            >
              {t.navSolutions}
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <div className={`absolute top-full left-1/2 -translate-x-1/2 pt-4 transition-all duration-300 ${
              isDropdownOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
            }`}>
              <div className="w-[280px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[2rem] p-4 shadow-lg">
                <div className="grid gap-2">
                  {solutions.map((item, idx) => (
                    <a
                      key={item.id}
                      href={item.href}
                      tabIndex={isDropdownOpen ? 0 : -1}
                      className={`flex items-center gap-4 p-3 rounded-2xl hover:bg-[var(--color-bg-alt)] transition-colors group/item ${focusedDropdownIndex === idx ? 'bg-[var(--color-bg-alt)]' : ''}`}
                      onClick={handleDropdownLinkClick}
                      onKeyDown={(e) => {
                        if (e.key === 'ArrowDown') {
                          e.preventDefault();
                          setFocusedDropdownIndex((idx + 1) % solutions.length);
                        }
                        if (e.key === 'ArrowUp') {
                          e.preventDefault();
                          setFocusedDropdownIndex((idx - 1 + solutions.length) % solutions.length);
                        }
                      }}
                    >
                      <div className="w-10 h-10 bg-[var(--color-surface)] rounded-xl flex items-center justify-center group-hover/item:scale-110 transition-transform">
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-default text-xs font-bold">{item.title}</p>
                        <p className="text-xs text-muted font-medium">{item.desc}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Link to="/#exito" className="hover:text-[var(--color-text)] focus-visible:text-[var(--color-text)] focus-visible:underline focus-visible:outline-none transition-colors">{t.navSuccess}</Link>
          <Link to="/#contacto" className="hover:text-[var(--color-text)] focus-visible:text-[var(--color-text)] focus-visible:underline focus-visible:outline-none transition-colors">{t.navContact}</Link>
        </div>

        {/* Hamburger for mobile */}
        <button
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--color-accent)] text-[var(--color-on-accent)]"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Abrir menú de navegación"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile Menu Drawer */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex justify-end"
            role="dialog"
            aria-modal="true"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div 
              className="w-[80vw] max-w-xs h-full bg-[var(--color-bg)] border-l border-[var(--color-border)] p-4 flex flex-col gap-4 shadow-lg animate-in slide-in-from-right" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-lg text-default">Menú</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-default p-2 rounded-lg" aria-label="Cerrar">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-col gap-1">
                <Link to="/" className="flex items-center gap-3 p-3 text-muted hover:bg-[var(--color-surface)] rounded-xl transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                  <ArrowLeft className="w-5 h-5" />
                  {t.navBack}
                </Link>
                <hr className="border-[var(--color-border)] my-1" />
                <a href="/#soluciones" className="flex items-center gap-3 p-3 text-muted hover:bg-[var(--color-surface)] rounded-xl transition-colors" onClick={() => setIsMobileMenuOpen(false)}>{t.navSolutions}</a>
                <a href="/#exito" className="flex items-center gap-3 p-3 text-muted hover:bg-[var(--color-surface)] rounded-xl transition-colors" onClick={() => setIsMobileMenuOpen(false)}>{t.navSuccess}</a>
                <a href="/#contacto" className="flex items-center gap-3 p-3 text-muted hover:bg-[var(--color-surface)] rounded-xl transition-colors" onClick={() => setIsMobileMenuOpen(false)}>{t.navContact}</a>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

const Footer: React.FC = () => {
  const { t } = useLanguage();
  return (
  <footer className="bg-[var(--color-bg-alt)] border-t border-[var(--color-border)] pt-12 md:pt-16 pb-8">
    <div className="container mx-auto px-4 md:px-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-12">
        <div>
          <span className="font-bold text-xl text-default">SmartConnect <span className="text-[var(--color-primary)]">AI</span></span>
          <p className="text-muted text-sm mt-3 leading-relaxed">{t.footerTagline}</p>
        </div>
        <nav aria-label="Navegación del footer">
          <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-4">{t.footerNavTitle}</h3>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link to="/" className="hover:text-[var(--color-text)] transition-colors">{t.footerNavInicio}</Link></li>
            <li><Link to="/#soluciones" className="hover:text-[var(--color-text)] transition-colors">{t.footerNavSoluciones}</Link></li>
            <li><Link to="/#exito" className="hover:text-[var(--color-text)] transition-colors">{t.footerNavExito}</Link></li>
            <li><Link to="/#contacto" className="hover:text-[var(--color-text)] transition-colors">{t.footerNavContacto}</Link></li>
          </ul>
        </nav>
        <div>
          <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-4">{t.footerLegalTitle}</h3>
          <ul className="space-y-2 text-sm text-muted">
            <li><a href="mailto:legal@smartconnect.ai" className="hover:text-[var(--color-text)] transition-colors">{t.footerLegalAviso}</a></li>
            <li><a href="mailto:legal@smartconnect.ai" className="hover:text-[var(--color-text)] transition-colors">{t.footerLegalPrivacidad}</a></li>
            <li><a href="mailto:legal@smartconnect.ai" className="hover:text-[var(--color-text)] transition-colors">{t.footerLegalCookies}</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[var(--color-border)] pt-6 md:pt-8 text-center text-muted text-sm">
        <p>&copy; {t.footerCopyright}</p>
      </div>
    </div>
  </footer>
  );
};

const CartaDigitalPremium: React.FC = () => {
  const { t } = useLanguage();
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  return (
    <>
      <Helmet>
        <title>{t.navbarCartaDigital} — Presentación | SmartConnect AI</title>
        <meta name="description" content={t.featuresCartaDigitalDesc} />
      </Helmet>

      <div className="min-h-screen bg-[var(--color-bg)] text-default">
        <Navbar />

        {/* HERO - Full Width */}
        <section id="hero" className="min-h-screen flex flex-col items-center justify-center px-4 md:px-6 pt-24 pb-16 relative overflow-hidden" style={{ 
          background: 'radial-gradient(ellipse at 30% 50%, rgba(201,168,76,0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 20%, rgba(46,204,113,0.05) 0%, transparent 50%), var(--color-bg)'
        }}>
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")` }}></div>
          
          <div className="container mx-auto relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-block text-xs font-semibold tracking-[0.25em] text-[var(--color-primary)] uppercase border border-[rgba(201,168,76,0.3)] px-4 py-2 rounded-full mb-6 md:mb-8">
                {t.cartaHeroEyebrow}
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.1] mb-4 md:mb-6 font-['Playfair_Display','serif']">
                {t.cartaHeroTitle1}<br />
                <span className="text-[var(--color-primary)] italic">{t.cartaHeroTitleAccent}</span><br />
                {t.cartaHeroTitle2}
              </h1>
              
              <p className="text-base md:text-lg lg:text-xl text-muted max-w-xl mx-auto mb-8 md:mb-12 leading-relaxed">
                {t.cartaHeroSubtitle}
              </p>
              
              <div className="flex flex-wrap gap-3 md:gap-4 justify-center mb-10 md:mb-16">
                <button onClick={() => scrollToSection('demo')} className="px-6 md:px-8 py-3 md:py-4 rounded-xl bg-[var(--color-primary)] text-[var(--color-bg)] font-semibold text-sm tracking-wider uppercase hover:opacity-90 transition-all cursor-pointer border-none min-h-[44px]">
                  {t.cartaHeroButtonDemo}
                </button>
                <button onClick={() => scrollToSection('dinero')} className="px-6 md:px-8 py-3 md:py-4 rounded-xl bg-transparent text-default font-medium text-sm cursor-pointer border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all min-h-[44px]">
                  {t.cartaHeroButtonCalc}
                </button>
              </div>
              
              <div className="flex flex-wrap gap-6 md:gap-10 lg:gap-12 justify-center">
                {[
                  { num: '5', label: t.cartaHeroStat1Label },
                  { num: '0%', label: t.cartaHeroStat2Label },
                  { num: '24/7', label: t.cartaHeroStat3Label },
                  { num: '∞', label: t.cartaHeroStat4Label },
                ].map((stat, idx) => (
                  <div key={idx} className="text-center">
                    <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-[var(--color-primary)] font-['Playfair_Display','serif']">{stat.num}</div>
                    <div className="text-xs text-muted uppercase tracking-widest mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
              
              {/* NFC Card Image */}
              <div className="mt-12 md:mt-16 flex justify-center">
                <div className="relative max-w-sm md:max-w-md mx-auto">
                  <img 
                    src="/assets/Tarjeta_NFC_negra_MontesTAP.webp" 
                    alt="Tarjeta NFC SmartConnect" 
                    className="w-full h-auto rounded-2xl shadow-2xl shadow-[var(--color-primary)]/20"
                  />
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full">
                    <span className="text-xs font-semibold text-[var(--color-primary)]">{t.cartaHeroCardLabel}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

{/* PROBLEMA - Full Width */}
        <section id="problema" className="py-16 md:py-24 bg-[var(--color-bg-alt)]">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-xs font-semibold tracking-[0.3em] text-[var(--color-primary)] uppercase mb-3 md:mb-4">{t.cartaProblemaTitle}</div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-[1.15] mb-4 md:mb-6 font-['Playfair_Display','serif']">{t.cartaProblemaSubtitle}</h2>
              <p className="text-base text-muted leading-relaxed max-w-lg md:max-w-xl mb-10 md:mb-14">
                {t.cartaProblemaDesc}
              </p>
              
              <div className="grid grid-cols-1 sm:2 lg:3 gap-4">
                {[
                  { icon: '💸', title: t.cartaProblemaItem1Title, desc: t.cartaProblemaItem1Desc },
                  { icon: '📜', title: t.cartaProblemaItem2Title, desc: t.cartaProblemaItem2Desc },
                  { icon: '🌍', title: t.cartaProblemaItem3Title, desc: t.cartaProblemaItem3Desc },
                  { icon: '📵', title: t.cartaProblemaItem4Title, desc: t.cartaProblemaItem4Desc },
                  { icon: '👻', title: t.cartaProblemaItem5Title, desc: t.cartaProblemaItem5Desc },
                  { icon: '📉', title: t.cartaProblemaItem6Title, desc: t.cartaProblemaItem6Desc },
                ].map((item, idx) => (
                  <div key={idx} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 md:p-6 hover:border-[rgba(231,76,60,0.4)] hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-px bg-[#E74C3C]"></div>
                    <div className="text-2xl md:text-3xl mb-3">{item.icon}</div>
                    <div className="font-bold text-base md:text-lg mb-2">{item.title}</div>
                    <div className="text-sm text-muted leading-relaxed">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SOLUCION - Full Width */}
        <section id="solucion" className="py-16 md:py-24" style={{ background: 'linear-gradient(135deg, var(--color-bg) 0%, #0D1A12 100%)' }}>
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-5xl mx-auto text-center">
              <div className="text-xs font-semibold tracking-[0.3em] text-[var(--color-primary)] uppercase mb-3 md:mb-4">{t.cartaSolucionTitle}</div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-[1.15] mb-6 md:mb-10 font-['Playfair_Display','serif']">{t.cartaSolucionSubtitle}</h2>
              
              <div className="bg-[rgba(46,204,113,0.08)] border border-[rgba(46,204,113,0.25)] rounded-2xl md:rounded-3xl p-6 md:p-10 lg:p-14 mt-8 md:mt-12 relative overflow-hidden">
                <p className="text-lg md:text-xl lg:text-2xl font-bold leading-relaxed font-['Playfair_Display','serif']">
                  Una <span className="text-[#2ECC71]">{t.cartaSolucionHighlight}</span> que trabaja para ti las 24 horas: dentro del local, en Google y en redes sociales.
                </p>
                <p className="text-base text-muted leading-relaxed mt-4 md:mt-6 max-w-2xl mx-auto">
                  {t.cartaSolucionDesc}
                </p>
                <div className="flex flex-wrap gap-2 md:gap-3 justify-center mt-6 md:mt-10">
                  {['📱 QR en mesa', '🌍 5 idiomas', '🎬 Fotos y vídeos', '🛒 Take Away', '💬 WhatsApp', '📧 Email marketing', '📊 Estadísticas', '🔍 SEO', '📱 Redes', '⭐ Google'].map((pill, idx) => (
                      <div key={idx} className="px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-[rgba(46,204,113,0.12)] border border-[rgba(46,204,113,0.25)] text-xs md:text-sm text-[#2ECC71] font-medium">
                        {pill}
                      </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

{/* BENEFICIOS - Full Width */}
        <section id="beneficios" className="py-16 md:py-24 bg-[var(--color-bg-alt)]">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12 md:mb-20">
                <div className="text-xs font-semibold tracking-[0.3em] text-[var(--color-primary)] uppercase mb-3 md:mb-4">{t.cartaBeneficiosTitle}</div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-[1.15] font-['Playfair_Display','serif']">{t.cartaBeneficiosSubtitle}</h2>
              </div>
              
              <div className="grid grid-cols-1 md:2 gap-px bg-[var(--color-border)]">
                {[
                  { num: '01', icon: '🍽️', title: t.cartaBeneficio1Title, desc: t.cartaBeneficio1Desc, tag: t.cartaBeneficio1Tag },
                  { num: '02', icon: '🌍', title: t.cartaBeneficio2Title, desc: t.cartaBeneficio2Desc, tag: t.cartaBeneficio2Tag },
                  { num: '03', icon: '💰', title: t.cartaBeneficio3Title, desc: t.cartaBeneficio3Desc, tag: t.cartaBeneficio3Tag },
                  { num: '04', icon: '👤', title: t.cartaBeneficio4Title, desc: t.cartaBeneficio4Desc, tag: t.cartaBeneficio4Tag },
                  { num: '05', icon: '💬', title: t.cartaBeneficio5Title, desc: t.cartaBeneficio5Desc, tag: t.cartaBeneficio5Tag },
                  { num: '06', icon: '🌐', title: t.cartaBeneficio6Title, desc: t.cartaBeneficio6Desc, tag: t.cartaBeneficio6Tag },
                  { num: '07', icon: '⚙️', title: t.cartaBeneficio7Title, desc: t.cartaBeneficio7Desc, tag: t.cartaBeneficio7Tag, fullWidth: true },
                ].map((item, idx) => (
                  <div key={idx} className={`p-6 md:p-8 lg:p-10 bg-[var(--color-surface)] flex gap-4 md:gap-6 ${item.fullWidth ? 'md:col-span-2 border-l-2 border-[var(--color-primary)]' : ''}`}>
                    <div className="text-3xl md:text-4xl lg:text-5xl font-black text-[rgba(201,168,76,0.2)] font-['Playfair_Display','serif'] leading-none hidden sm:block">{item.num}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 md:gap-4">
                        <div className="text-xl md:text-2xl lg:text-3xl flex-shrink-0">{item.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-base md:text-lg lg:text-xl mb-2">{item.title}</div>
                          <div className="text-sm text-muted leading-relaxed">{item.desc}</div>
                          <div className="inline-block mt-3 px-3 py-1 rounded-full bg-[rgba(201,168,76,0.15)] border border-[rgba(201,168,76,0.3)] text-xs text-[var(--color-primary)] font-semibold">{item.tag}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* COMO FUNCIONA - Full Width */}
        <section id="como-funciona" className="py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12 md:mb-16">
                <div className="text-xs font-semibold tracking-[0.3em] text-[var(--color-primary)] uppercase mb-3 md:mb-4">{t.cartaFlujoTitle}</div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-[1.15] font-['Playfair_Display','serif']">{t.cartaFlujoSubtitle}</h2>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 relative">
                <div className="absolute top-14 left-[12%] right-[12%] h-px bg-gradient-to-r from-[var(--color-primary)] to-transparent hidden md:block" style={{ opacity: 0.3 }}></div>
                {[
                  { icon: '📱', title: t.cartaFlujoStep1Title, desc: t.cartaFlujoStep1Desc },
                  { icon: '🎬', title: t.cartaFlujoStep2Title, desc: t.cartaFlujoStep2Desc },
                  { icon: '🔔', title: t.cartaFlujoStep3Title, desc: t.cartaFlujoStep3Desc },
                  { icon: '✅', title: t.cartaFlujoStep4Title, desc: t.cartaFlujoStep4Desc },
                ].map((step, idx) => (
                  <div key={idx} className="text-center relative z-10">
                    <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full bg-[var(--color-surface)] border-2 border-[var(--color-primary)] flex items-center justify-center text-xl md:text-2xl lg:text-3xl mx-auto mb-3 md:mb-4">
                      {step.icon}
                    </div>
                    <div className="font-bold text-sm md:text-base mb-1">{step.title}</div>
                    <div className="text-xs text-muted leading-relaxed hidden sm:block">{step.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* DINERO - Full Width */}
        <section id="dinero" className="py-16 md:py-24 bg-[var(--color-bg-alt)]">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <div className="text-xs font-semibold tracking-[0.3em] text-[var(--color-primary)] uppercase mb-3 md:mb-4">{t.cartaDineroTitle}</div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-[1.15] mb-4 md:mb-6 font-['Playfair_Display','serif']">{t.cartaDineroSubtitle}</h2>
              <p className="text-base text-muted leading-relaxed mb-10 md:mb-14 max-w-lg mx-auto">
                {t.cartaDineroCalcDesc}
              </p>
              
              <div className="grid grid-cols-1 md:3 gap-4 md:gap-6 items-stretch mb-8 md:mb-12">
                <div className="bg-[var(--color-surface)] rounded-2xl p-5 md:p-6 border border-[rgba(231,76,60,0.3)]">
                  <div className="text-xs font-bold tracking-widest uppercase text-[#E74C3C] mb-4">{t.cartaDineroIntermediarios}</div>
                  <div className="flex justify-between py-2 border-b border-[var(--color-border)] text-sm">
                    <span>{t.cartaDineroUber}</span>
                    <span className="font-bold text-[#E74C3C]">−900€</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[var(--color-border)] text-sm">
                    <span>{t.cartaDineroGlovo}</span>
                    <span className="font-bold text-[#E74C3C]">−840€</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[var(--color-border)] text-sm">
                    <span>{t.cartaDineroJustEat}</span>
                    <span className="font-bold text-[#E74C3C]">−750€</span>
                  </div>
                  <div className="flex justify-between pt-3 mt-3 border-t border-[var(--color-border)]">
                    <span className="text-sm text-muted">{t.cartaDineroTotal}</span>
                    <span className="text-xl font-bold text-[#E74C3C] font-['Playfair_Display','serif']">−870€</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-center">
                  <div className="text-xl md:text-2xl font-black text-[var(--color-primary)] font-['Playfair_Display','serif']">VS</div>
                </div>
                
                <div className="bg-[var(--color-surface)] rounded-2xl p-5 md:p-6 border border-[rgba(46,204,113,0.3)]">
                  <div className="text-xs font-bold tracking-widest uppercase text-[#2ECC71] mb-4">{t.cartaDineroTuCarta}</div>
                  <div className="flex justify-between py-2 border-b border-[var(--color-border)] text-sm">
                    <span>{t.cartaDineroComision}</span>
                    <span className="font-bold text-[#2ECC71]">0€</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[var(--color-border)] text-sm">
                    <span>{t.cartaDineroSuscripcion}</span>
                    <span className="font-bold text-[#2ECC71]">Fija</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[var(--color-border)] text-sm">
                    <span>{t.cartaDineroClientes}</span>
                    <span className="font-bold text-[#2ECC71]">Tuyos</span>
                  </div>
                  <div className="flex justify-between pt-3 mt-3 border-t border-[var(--color-border)]">
                    <span className="text-sm text-muted">{t.cartaDineroAhorro}</span>
                    <span className="text-xl font-bold text-[#2ECC71] font-['Playfair_Display','serif']">+700€</span>
                  </div>
                </div>
              </div>
              
              <div className="inline-block px-6 md:px-10 py-4 md:py-5 rounded-xl bg-[rgba(46,204,113,0.12)] border border-[rgba(46,204,113,0.25)]">
                <span className="text-base md:text-lg font-semibold text-[#2ECC71]">Ahorra más de </span>
                <span className="text-2xl md:text-3xl font-black text-[#2ECC71] font-['Playfair_Display','serif']"> {t.cartaDineroAhorroAnual}</span>
              </div>
            </div>
          </div>
        </section>

        {/* BBDD - Full Width */}
        <section id="bbdd" className="py-16 md:py-24" style={{ background: 'linear-gradient(135deg, var(--color-bg) 0%, #0A0D15 100%)' }}>
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
              <div className="text-xs font-semibold tracking-[0.3em] text-[var(--color-primary)] uppercase mb-3 md:mb-4">{t.cartaBBDDTitle}</div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-[1.15] mb-4 md:mb-6 font-['Playfair_Display','serif']">{t.cartaBBDDSubtitle}</h2>
              <p className="text-base text-muted leading-relaxed">
                {t.cartaBBDDDesc}
              </p>
            </div>
            
            <div className="flex flex-col items-center max-w-md mx-auto">
              <div className="flex flex-wrap gap-2 md:gap-3 justify-center mb-6 md:mb-8">
                <div className="px-3 md:px-4 py-2 rounded-lg bg-[var(--color-surface)] border border-[rgba(201,168,76,0.2)] text-xs md:text-sm font-medium flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]"></div>
                  {t.cartaBBDDLabel1}
                </div>
                <div className="px-3 md:px-4 py-2 rounded-lg bg-[var(--color-surface)] border border-[rgba(201,168,76,0.2)] text-xs md:text-sm font-medium flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]"></div>
                  {t.cartaBBDDLabel2}
                </div>
              </div>
              
              <div className="text-2xl text-[var(--color-primary)] mb-4">↓</div>
              
              <div className="bg-[var(--color-surface)] border border-[rgba(201,168,76,0.3)] rounded-2xl p-6 md:p-8 w-full relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--color-primary)] text-[var(--color-bg)] text-xs font-bold tracking-widest px-4 py-1 rounded-full">{t.cartaBBDDLabelTuBBDD}</div>
                <div className="flex flex-wrap gap-2 md:gap-3 justify-center">
                  <div className="px-3 md:px-4 py-1.5 md:py-2 rounded bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-xs md:text-sm text-muted">{t.cartaBBDDData1}</div>
                  <div className="px-3 md:px-4 py-1.5 md:py-2 rounded bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-xs md:text-sm text-muted">{t.cartaBBDDData2}</div>
                  <div className="px-3 md:px-4 py-1.5 md:py-2 rounded bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-xs md:text-sm text-muted">{t.cartaBBDDData3}</div>
                  <div className="px-3 md:px-4 py-1.5 md:py-2 rounded bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-xs md:text-sm text-muted">{t.cartaBBDDData4}</div>
                </div>
              </div>
              
              <div className="text-2xl text-[var(--color-primary)] my-4">↓</div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3 w-full">
                <div className="px-3 md:px-4 py-3 md:py-4 rounded-xl text-center bg-[rgba(201,168,76,0.12)] border border-[rgba(201,168,76,0.25)] text-xs md:text-sm font-semibold text-[var(--color-primary)]">{t.cartaBBDDAction1}</div>
                <div className="px-3 md:px-4 py-3 md:py-4 rounded-xl text-center bg-[rgba(201,168,76,0.12)] border border-[rgba(201,168,76,0.25)] text-xs md:text-sm font-semibold text-[var(--color-primary)]">{t.cartaBBDDAction2}</div>
                <div className="px-3 md:px-4 py-3 md:py-4 rounded-xl text-center bg-[rgba(201,168,76,0.12)] border border-[rgba(201,168,76,0.25)] text-xs md:text-sm font-semibold text-[var(--color-primary)]">{t.cartaBBDDAction3}</div>
              </div>
            </div>
          </div>
        </section>

        {/* DEMO - Full Width */}
        <section id="demo" className="py-16 md:py-24 bg-[var(--color-bg-alt)]">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12 md:mb-16">
              <div className="text-xs font-semibold tracking-[0.3em] text-[var(--color-primary)] uppercase mb-3 md:mb-4">{t.cartaDemoTitle}</div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-[1.15] font-['Playfair_Display','serif']">{t.cartaFlujoSubtitle}</h2>
            </div>
            
            {/* Video Showcase - Plato en formato TV */}
            <div className="max-w-4xl mx-auto mb-10 md:mb-14">
              <div className="relative bg-black rounded-3xl overflow-hidden shadow-2xl">
                {/* TV Frame */}
                <div className="absolute inset-0 pointer-events-none z-10 border-[10px] md:border-[16px] border-[#0f0f0f] rounded-3xl"></div>
                {/* Scanlines effect */}
                <div className="absolute inset-0 pointer-events-none z-10 opacity-[0.03]" style={{ 
                  backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)'
                }}></div>
                <video 
                  src="/assets/video.mp4" 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  className="w-full aspect-video object-cover"
                />
                {/* Label */}
                <div className="absolute bottom-4 left-4 z-20">
                  <div className="px-4 py-2 bg-black/70 backdrop-blur-sm rounded-xl">
                    <span className="text-sm text-white font-medium">{t.cartaDemoVideoLabel}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
              {/* CARTA */}
              <div className="bg-[var(--color-surface)] rounded-2xl overflow-hidden border border-[var(--color-border)] hover:-translate-y-1 transition-all cursor-pointer">
                <div className="px-3 py-2 bg-[var(--color-bg-alt)] flex items-center gap-1.5 border-b border-[var(--color-border)]">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]"></div>
                  <span className="text-xs text-muted ml-2">{t.cartaDemoScreen1Label}</span>
                </div>
                <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/9' }}>
                  <img 
                    src="/assets/carta-digital-cliente.png" 
                    alt="Carta digital - Vista del cliente" 
                    className="absolute inset-0 w-full h-full object-contain cursor-pointer hover:scale-[1.02] transition-transform"
                    onClick={() => setLightboxImage('/assets/carta-digital-cliente.png')}
                  />
                </div>
                <div className="px-4 py-3 font-bold text-sm border-t border-[var(--color-border)] text-[var(--color-primary)] flex items-center gap-2">
                  {t.cartaDemoScreen1Title}
                </div>
              </div>

              {/* DASHBOARD */}
              <div className="bg-[var(--color-surface)] rounded-2xl overflow-hidden border border-[var(--color-border)] hover:-translate-y-1 transition-all cursor-pointer">
                <div className="px-3 py-2 bg-[var(--color-bg-alt)] flex items-center gap-1.5 border-b border-[var(--color-border)]">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]"></div>
                  <span className="text-xs text-muted ml-2">{t.cartaDemoScreen2Label}</span>
                </div>
                <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/9' }}>
                  <img 
                    src="/assets/carta-digital-dashboard.png" 
                    alt="Dashboard - Panel de administración" 
                    className="absolute inset-0 w-full h-full object-contain cursor-pointer hover:scale-[1.02] transition-transform"
                    onClick={() => setLightboxImage('/assets/carta-digital-dashboard.png')}
                  />
                </div>
                <div className="px-4 py-3 font-bold text-sm border-t border-[var(--color-border)] text-[var(--color-primary)] flex items-center gap-2">
                  {t.cartaDemoScreen2Title}
                </div>
              </div>

              {/* PEDIDOS */}
              <div className="bg-[var(--color-surface)] rounded-2xl overflow-hidden border border-[var(--color-border)] hover:-translate-y-1 transition-all cursor-pointer md:col-span-2 lg:col-span-1">
                <div className="px-3 py-2 bg-[var(--color-bg-alt)] flex items-center gap-1.5 border-b border-[var(--color-border)]">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]"></div>
                  <span className="text-xs text-muted ml-2">{t.cartaDemoScreen3Label}</span>
                </div>
                <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/9' }}>
                  <img 
                    src="/assets/carta-digital-pedidos.png" 
                    alt="Gestión de pedidos" 
                    className="absolute inset-0 w-full h-full object-contain cursor-pointer hover:scale-[1.02] transition-transform"
                    onClick={() => setLightboxImage('/assets/carta-digital-pedidos.png')}
                  />
                </div>
                <div className="px-4 py-3 font-bold text-sm border-t border-[var(--color-border)] text-[var(--color-primary)] flex items-center gap-2">
                  {t.cartaDemoScreen3Title}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA FINAL - Full Width */}
        <section id="cta-final" className="py-16 md:py-24" style={{ 
          background: 'radial-gradient(ellipse at 50% 50%, rgba(201,168,76,0.12) 0%, transparent 70%), var(--color-bg)'
        }}>
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto">
              <div className="text-xs font-semibold tracking-[0.25em] text-[var(--color-primary)] uppercase mb-4">{t.cartaCTATitle}</div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-[1.1] mb-6 font-['Playfair_Display','serif']">
                {t.cartaCTASubtitle}
              </h2>
              <p className="text-base md:text-lg text-muted max-w-md mx-auto mb-8 md:mb-12 leading-relaxed">
                {t.featuresCartaDigitalDesc}
              </p>
              
              <div className="flex flex-wrap gap-3 md:gap-4 justify-center mb-12 md:mb-16">
                <Link to="#contacto?servicio=Carta%20Digital%20Premium" className="px-6 md:px-10 py-3 md:py-4 rounded-xl bg-[var(--color-primary)] text-[var(--color-bg)] font-bold text-sm tracking-wider uppercase hover:opacity-90 transition-all cursor-pointer border-none min-h-[48px] inline-flex items-center justify-center">
                  {t.cartaCTABtnDemo}
                </Link>
                <Link to="#contacto?servicio=Carta%20Digital%20Premium" className="px-6 md:px-10 py-3 md:py-4 rounded-xl bg-transparent text-default font-medium text-sm cursor-pointer border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all min-h-[48px] flex items-center gap-2">
                  {t.cartaCTABtnContact}
                </Link>
              </div>
              
              <div className="w-px h-10 bg-[var(--color-primary)] mx-auto mb-6"></div>
              
              <div className="flex flex-wrap gap-4 md:gap-8 justify-center text-sm text-muted">
                <span className="flex items-center gap-2">{t.cartaCTANoContract}</span>
                <span className="flex items-center gap-2">{t.cartaCTASignup48h}</span>
                <span className="flex items-center gap-2">{t.cartaCTASupport}</span>
                <span className="flex items-center gap-2">{t.cartaCTANoComm}</span>
              </div>
            </div>
          </div>
        </section>

        <Footer />

        {/* Lightbox Modal */}
        {lightboxImage && (
          <div 
            className="fixed inset-0 z-[300] bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={() => setLightboxImage(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Ampliar imagen"
          >
            <button 
              className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              onClick={() => setLightboxImage(null)}
              aria-label="Cerrar"
            >
              <X className="w-6 h-6" />
            </button>
            <div 
              className="relative max-w-5xl w-full max-h-[90vh] animate-in zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={lightboxImage} 
                alt="Imagen ampliada" 
                className="w-full h-full object-contain rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartaDigitalPremium;