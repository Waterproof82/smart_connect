import React, { useState } from 'react';
import { Cpu, ChevronDown, Code2, Settings2, Smartphone, Utensils, Shield, X, Menu } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import LanguageSelector from '@shared/components/LanguageSelector';
import { useLanguage } from '@shared/context/LanguageContext';

interface NavbarProps {
  scrolled: boolean;
}

interface SolutionItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  href: string;
  internal?: boolean;
  external?: boolean;
}

const DropdownMenuItem: React.FC<{
  item: SolutionItem;
  idx: number;
  solutionsLength: number;
  isDropdownOpen: boolean;
  focusedDropdownIndex: number;
  isActive: (href: string, internal?: boolean) => boolean;
  handleNavClick: (e: React.MouseEvent<HTMLAnchorElement> | undefined, href: string, internal?: boolean, external?: boolean) => void;
  onFocusChange: (idx: number) => void;
  onClose: () => void;
}> = ({ item, idx, solutionsLength, isDropdownOpen, focusedDropdownIndex, isActive, handleNavClick, onFocusChange, onClose }) => {
  const active = isActive(item.href, item.internal);
  const itemRef = React.useRef<HTMLAnchorElement>(null);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      onFocusChange((idx + 1) % solutionsLength);
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      onFocusChange((idx - 1 + solutionsLength) % solutionsLength);
    }
    if (e.key === 'Escape') {
      onClose();
      onFocusChange(-1);
    }
  };

  React.useEffect(() => {
    if (focusedDropdownIndex === idx && itemRef.current) {
      itemRef.current.focus();
    }
  }, [focusedDropdownIndex, idx]);

  const itemClasses = `flex items-center gap-4 p-3 rounded-2xl transition-colors group/item ${active ? 'bg-[var(--color-accent-subtle)]' : 'hover:bg-[var(--color-bg-alt)]'} ${focusedDropdownIndex === idx ? 'bg-[var(--color-bg-alt)]' : ''}`;
  
  const itemContent = (
    <>
      <div className="w-10 h-10 bg-[var(--color-surface)] rounded-xl flex items-center justify-center group-hover/item:scale-110 transition-transform">
        {item.icon}
      </div>
      <div>
        <p className={`text-xs font-bold ${active ? 'text-[var(--color-primary)]' : 'text-default'}`}>{item.title}</p>
        <p className="text-xs text-muted font-medium">{item.desc}</p>
      </div>
    </>
  );

  if (item.internal) {
    return (
      <Link
        ref={itemRef as unknown as React.Ref<HTMLAnchorElement>}
        to={item.href}
        tabIndex={isDropdownOpen ? 0 : -1}
        className={itemClasses}
        onClick={onClose}
        onKeyDown={handleKeyDown}
      >
        {itemContent}
      </Link>
    );
  }

  return (
    <a
      ref={itemRef as React.Ref<HTMLAnchorElement>}
      href={item.href}
      target={item.external ? "_blank" : undefined}
      rel={item.external ? "noopener noreferrer" : undefined}
      tabIndex={isDropdownOpen ? 0 : -1}
      className={itemClasses}
      onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
        handleNavClick(e, item.href, item.internal, item.external);
        onClose();
      }}
      onKeyDown={handleKeyDown}
    >
      {itemContent}
    </a>
  );
};

export const Navbar: React.FC<NavbarProps> = ({ scrolled }) => {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [focusedDropdownIndex, setFocusedDropdownIndex] = useState<number>(-1);

  const isActive = (href: string, internal?: boolean) => {
    if (internal) return location.pathname === href;
    if (href.startsWith('#')) return location.pathname === '/' && location.hash === href;
    return false;
  };

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement> | undefined,
    href: string,
    internal?: boolean,
    external?: boolean
  ) => {
    if (external) {
      setIsDropdownOpen(false);
      setIsMobileMenuOpen(false);
      return;
    }
    
    if (e) e.preventDefault();
    
    if (internal) {
      if (href.startsWith('/')) {
        navigate(href);
      }
    } else if (href.startsWith('#')) {
      if (location.pathname === '/') {
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate(`/${href}`);
      }
    }
    
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const solutions: SolutionItem[] = [
    {
      id: 'software-ia',
      icon: <Code2 className="w-5 h-5 text-[var(--color-icon-blue)]" />,
      title: t.navbarSoftwareIA,
      desc: t.navbarSoftwareIADesc,
      href: '#soluciones'
    },
    {
      id: 'automatizacion-n8n',
      icon: <Settings2 className="w-5 h-5 text-[var(--color-icon-purple)]" />,
      title: t.navbarAutomation,
      desc: t.navbarAutomationDesc,
      href: '#soluciones'
    },
    {
      id: 'tarjetas-nfc',
      icon: <Smartphone className="w-5 h-5 text-[var(--color-icon-emerald)]" />,
      title: t.navbarNFC,
      desc: t.navbarNFCDesc,
      href: '/tap-review',
      internal: true
    },
    {
      id: 'qribar',
      icon: <Utensils className="w-5 h-5 text-[var(--color-icon-amber)]" />,
      title: t.navbarQribar,
      desc: t.navbarQribarDesc,
      href: 'https://qribar.es',
      external: true
    },
    {
      id: 'carta-digital',
      icon: <Utensils className="w-5 h-5 text-[var(--color-icon-emerald)]" />,
      title: t.navbarCartaDigital,
      desc: t.navbarCartaDigitalDesc,
      href: '/carta-digital',
      internal: true
    }
  ];

  return (
    <nav
      aria-label="Navegación principal"
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 border-b border-[var(--color-border)] bg-[var(--color-bg)] ${
        scrolled ? 'py-2 md:py-3' : 'py-3 md:py-6'
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <a 
          href="#inicio" 
          className="flex items-center gap-2 group" 
          onClick={(e) => handleNavClick(e, '#inicio')}
        >
          <div className="w-10 h-10 bg-[var(--color-accent)] rounded-xl flex items-center justify-center shadow-lg motion-safe:group-hover:scale-110 transition-transform">
            <Cpu className="text-[var(--color-on-accent)] w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tighter text-default">
            SmartConnect <span className="text-[var(--color-primary)]">AI</span>
          </span>
        </a>

        {/* Navigation - Desktop */}
        <div className="hidden md:flex items-center gap-10 text-sm font-semibold text-muted">
          <button
            type="button"
            className="relative group outline-none"
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => { 
              setIsDropdownOpen(false); 
              setFocusedDropdownIndex(-1); 
            }}
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
              {t.navSolutions}
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <div className={`absolute top-full left-1/2 -translate-x-1/2 pt-4 transition-all duration-300 ${
              isDropdownOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
            }`}>
              <div className="w-[280px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[2rem] p-4 shadow-lg">
                <div className="grid gap-2">
                  {solutions.map((item, idx) => (
                    <DropdownMenuItem
                      key={item.id}
                      item={item}
                      idx={idx}
                      solutionsLength={solutions.length}
                      isDropdownOpen={isDropdownOpen}
                      focusedDropdownIndex={focusedDropdownIndex}
                      isActive={isActive}
                      handleNavClick={handleNavClick}
                      onFocusChange={setFocusedDropdownIndex}
                      onClose={() => {
                        setIsDropdownOpen(false);
                        setIsMobileMenuOpen(false);
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </button>

          <a 
            href="#exito" 
            className="hover:text-[var(--color-text)] focus-visible:text-[var(--color-text)] focus-visible:underline focus-visible:outline-none transition-colors" 
            onClick={(e) => handleNavClick(e, '#exito')}
          >
            {t.navSuccess}
          </a>
          <a 
            href="#contacto" 
            className="hover:text-[var(--color-text)] focus-visible:text-[var(--color-text)] focus-visible:underline focus-visible:outline-none transition-colors" 
            onClick={(e) => handleNavClick(e, '#contacto')}
          >
            {t.navContact}
          </a>
          <LanguageSelector />
          <Link 
            to="/admin" 
            className="flex items-center gap-2 text-muted hover:text-[var(--color-primary)] transition-colors"
          >
            <Shield className="w-4 h-4" />
            <span>{t.navAdmin}</span>
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
          <>
            <div
              className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <dialog 
              className="fixed inset-y-0 right-0 z-[200] w-[80vw] max-w-xs bg-[var(--color-bg)] border-l border-[var(--color-border)] p-6 flex flex-col gap-6 shadow-lg animate-in slide-in-from-right" 
              open={isMobileMenuOpen}
              onCancel={() => setIsMobileMenuOpen(false)}
              aria-label="Menú de navegación">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xl text-default">SmartConnect <span className="text-[var(--color-primary)]">AI</span></span>
                <div className="flex items-center gap-4">
                  <LanguageSelector />
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)} 
                    className="text-default p-2 rounded-lg focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]" 
                    aria-label="Cerrar menu"
                    autoFocus
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <nav className="flex flex-col gap-1" aria-label="Enlaces de navegación">
                {solutions.map((item) => {
                  const active = isActive(item.href, item.internal);
                  return (
                    <React.Fragment key={item.id}>
                      {item.internal ? (
                        <Link
                          to={item.href}
                          className={`flex items-center gap-3 p-3 min-h-[44px] hover:bg-[var(--color-surface)] focus:bg-[var(--color-surface)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-xl transition-colors ${active ? 'bg-[var(--color-accent-subtle)] text-[var(--color-primary)]' : 'text-muted'}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {item.icon}
                          <span className="font-semibold">{item.title}</span>
                        </Link>
                      ) : (
                        <a
                          href={item.href}
                          className={`flex items-center gap-3 p-3 min-h-[44px] hover:bg-[var(--color-surface)] focus:bg-[var(--color-surface)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-xl transition-colors ${active ? 'bg-[var(--color-accent-subtle)] text-[var(--color-primary)]' : 'text-muted'}`}
                          target={item.external ? "_blank" : undefined}
                          rel={item.external ? "noopener noreferrer" : undefined}
                          onClick={(e) => handleNavClick(e, item.href, item.internal, item.external)}
                        >
                          {item.icon}
                          <span className="font-semibold">{item.title}</span>
                        </a>
                      )}
                    </React.Fragment>
                  );
                })}
                <hr className="border-[var(--color-border)] my-2" />
                <a 
                  href="#exito" 
                  className="text-muted p-3 min-h-[44px] flex items-center hover:bg-[var(--color-surface)] focus:bg-[var(--color-surface)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-xl transition-colors" 
                  onClick={(e) => handleNavClick(e, '#exito')}
                >
                  {t.navSuccess}
                </a>
                <a 
                  href="#contacto" 
                  className="text-muted p-3 min-h-[44px] flex items-center hover:bg-[var(--color-surface)] focus:bg-[var(--color-surface)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-xl transition-colors" 
                  onClick={(e) => handleNavClick(e, '#contacto')}
                >
                  {t.navContact}
                </a>
                <Link 
                  to="/admin" 
                  className="text-muted flex items-center gap-2 p-3 min-h-[44px] hover:bg-[var(--color-surface)] focus:bg-[var(--color-surface)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-xl transition-colors" 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin</span>
                </Link>
              </nav>
            </dialog>
          </>
        )}
      </div>
    </nav>
  );
};
