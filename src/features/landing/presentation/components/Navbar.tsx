import React, { useState } from 'react';
import { Cpu, ChevronDown, Code2, Settings2, Smartphone, Utensils, Shield, X, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NavbarProps {
  scrolled: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ scrolled }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [focusedDropdownIndex, setFocusedDropdownIndex] = useState<number>(-1);

  const solutions = [
    {
      id: 'software-ia',
      icon: <Code2 className="w-5 h-5 text-[var(--color-icon-blue)]" />,
      title: 'Software & IA',
      desc: 'Soluciones a medida',
      href: '#soluciones'
    },
    {
      id: 'automatizacion-n8n',
      icon: <Settings2 className="w-5 h-5 text-[var(--color-icon-purple)]" />,
      title: 'Automatización n8n',
      desc: 'Flujos inteligentes',
      href: '#soluciones'
    },
    {
      id: 'tarjetas-nfc',
      icon: <Smartphone className="w-5 h-5 text-[var(--color-icon-emerald)]" />,
      title: 'Tarjetas NFC',
      desc: 'Reseñas al instante',
      href: '#soluciones'
    },
    {
      id: 'qribar',
      icon: <Utensils className="w-5 h-5 text-[var(--color-icon-amber)]" />,
      title: 'QR iBar',
      desc: 'Menús digitales HOSTELERÍA',
      href: 'https://qribar.es',
      external: true
    }
  ];

  const handleMobileLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    setIsMobileMenuOpen(false);
    if (e.currentTarget.hash) {
      e.preventDefault();
      const hash = e.currentTarget.hash;
      setTimeout(() => {
        document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  };

  const handleDropdownLinkClick = (e?: React.MouseEvent<HTMLAnchorElement>) => {
    setIsDropdownOpen(false);
    if (e?.currentTarget?.hash) {
      const target = document.querySelector(e.currentTarget.hash);
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
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <a href="#inicio" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-[var(--color-accent)] rounded-xl flex items-center justify-center shadow-lg motion-safe:group-hover:scale-110 transition-transform">
            <Cpu className="text-[var(--color-on-accent)] w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tighter text-default">
            SmartConnect <span className="text-[var(--color-primary)]">AI</span>
          </span>
        </a>

        {/* Navigation - Desktop */}
        <div className="hidden md:flex items-center gap-10 text-sm font-semibold text-muted">
          <div
            className="relative group"
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => { setIsDropdownOpen(false); setFocusedDropdownIndex(-1); }}
            onFocus={() => setIsDropdownOpen(true)}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setIsDropdownOpen(false);
                setFocusedDropdownIndex(-1);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsDropdownOpen(!isDropdownOpen);
              }
              if (e.key === 'Escape') setIsDropdownOpen(false);
              if (isDropdownOpen) {
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setFocusedDropdownIndex(0);
                }
                if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setFocusedDropdownIndex(solutions.length - 1);
                }
              }
            }}
          >
            <button
              className="flex items-center gap-1.5 hover:text-[var(--color-text)] transition-colors py-2 outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-lg"
              aria-haspopup="true"
              aria-expanded={isDropdownOpen}
            >
              Soluciones
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
                      target={item.external ? "_blank" : undefined}
                      rel={item.external ? "noopener noreferrer" : undefined}
                      tabIndex={isDropdownOpen ? 0 : -1}
                      className={`flex items-center gap-4 p-3 rounded-2xl hover:bg-[var(--color-bg-alt)] transition-colors group/item ${focusedDropdownIndex === idx ? 'bg-[var(--color-bg-alt)]' : ''}`}
                      onClick={(e) => {
                        if (item.external) {
                          setIsDropdownOpen(false);
                        } else {
                          handleDropdownLinkClick(e);
                          setIsDropdownOpen(false);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'ArrowDown') {
                          e.preventDefault();
                          setFocusedDropdownIndex((idx + 1) % solutions.length);
                        }
                        if (e.key === 'ArrowUp') {
                          e.preventDefault();
                          setFocusedDropdownIndex((idx - 1 + solutions.length) % solutions.length);
                        }
                        if (e.key === 'Escape') {
                          setIsDropdownOpen(false);
                          setFocusedDropdownIndex(-1);
                        }
                      }}
                      ref={(el) => {
                        if (focusedDropdownIndex === idx && el) {
                          el.focus();
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

          <a href="#exito" className="hover:text-[var(--color-text)] focus-visible:text-[var(--color-text)] focus-visible:underline focus-visible:outline-none transition-colors" onClick={handleDropdownLinkClick}>Éxito</a>
          <a href="#contacto" className="hover:text-[var(--color-text)] focus-visible:text-[var(--color-text)] focus-visible:underline focus-visible:outline-none transition-colors" onClick={handleDropdownLinkClick}>Contacto</a>
          <Link to="/admin" className="flex items-center gap-2 text-muted hover:text-[var(--color-primary)] transition-colors">
            <Shield className="w-4 h-4" />
            <span>Admin</span>
          </Link>
        </div>

        {/* Hamburger for mobile */}
        <button
          className="md:hidden flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--color-accent)] text-[var(--color-on-accent)]"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Abrir menú de navegación"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Mobile Menu Drawer */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex justify-end"
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación"
            onClick={() => setIsMobileMenuOpen(false)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setIsMobileMenuOpen(false);
            }}
          >
            <div 
              className="w-[80vw] max-w-xs h-full bg-[var(--color-bg)] border-l border-[var(--color-border)] p-6 flex flex-col gap-6 shadow-lg animate-in slide-in-from-right" 
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Menú de navegación"
              tabIndex={-1}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xl text-default">SmartConnect <span className="text-[var(--color-primary)]">AI</span></span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-default p-2 rounded-lg focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]" aria-label="Cerrar menu" autoFocus>
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex flex-col gap-1" role="navigation" aria-label="Enlaces de navegación">
                {solutions.map((item) => (
                  <a
                    key={item.id}
                    href={item.href}
                    className="flex items-center gap-3 p-3 text-muted min-h-[44px] hover:bg-[var(--color-surface)] focus:bg-[var(--color-surface)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-xl transition-colors"
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                    onClick={(e) => item.external ? setIsMobileMenuOpen(false) : handleMobileLinkClick(e)}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </a>
                ))}
                <hr className="border-[var(--color-border)] my-2" />
                <a href="#exito" className="text-muted p-3 min-h-[44px] flex items-center hover:bg-[var(--color-surface)] focus:bg-[var(--color-surface)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-xl transition-colors" onClick={handleMobileLinkClick}>Éxito</a>
                <a href="#contacto" className="text-muted p-3 min-h-[44px] flex items-center hover:bg-[var(--color-surface)] focus:bg-[var(--color-surface)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-xl transition-colors" onClick={handleMobileLinkClick}>Contacto</a>
                <Link to="/admin" className="text-muted flex items-center gap-2 p-3 min-h-[44px] hover:bg-[var(--color-surface)] focus:bg-[var(--color-surface)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-xl transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                  <Shield className="w-4 h-4" />
                  <span>Admin</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};